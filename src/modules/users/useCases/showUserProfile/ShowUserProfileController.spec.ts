import { Connection } from "typeorm";
import createConnection from "../../../../shared/infra/typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
let id: string;

describe("ShowUserProfileController", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    id = uuid();
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

    const { body: result } = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.id).toEqual(id);
    expect(result.name).toEqual("admin");
    expect(result.email).toEqual("admin@test.com");
  });
});
