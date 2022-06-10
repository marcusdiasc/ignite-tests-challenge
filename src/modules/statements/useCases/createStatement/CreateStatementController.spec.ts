import { Connection } from "typeorm";
import createConnection from "../../../../shared/infra/typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("CreateStatementController", () => {
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

  test("should create a deposit statement", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@test.com", password: "admin" });

    const { token } = responseToken.body;

    const { body: result } = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "Test" })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.amount).toEqual(100);
    expect(result.type).toEqual("deposit");
    expect(result.description).toEqual("Test");
  });

  test("should create a withdraw statement", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@test.com", password: "admin" });

    const { token } = responseToken.body;

    const { body: result } = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({ amount: 100, description: "Test" })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.amount).toEqual(100);
    expect(result.type).toEqual("withdraw");
    expect(result.description).toEqual("Test");
  });
});
