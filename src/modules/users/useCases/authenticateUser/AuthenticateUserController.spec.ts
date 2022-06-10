import { Connection } from "typeorm";
import createConnection from "../../../../shared/infra/typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let connection: Connection;

describe("AuthtenticateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password) VALUES ('${id}', 'admin', 'admin@test.com', '${password}')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("should authenticate a user", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@test.com", password: "admin" });

    const { token } = responseToken.body;

    expect(token).not.toBeNull();
  });

  test("should not authenticate a user if email is invalid", async () => {
    const result = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@tes.com", password: "admin" });

    expect(result.statusCode).toEqual(401);
    expect(result.body).toEqual({ message: "Incorrect email or password" });
  });

  test("should not authenticate a user if password is invalid", async () => {
    const result = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@test.com", password: "admin1234" });

    expect(result.statusCode).toEqual(401);
    expect(result.body).toEqual({ message: "Incorrect email or password" });
  });
});
