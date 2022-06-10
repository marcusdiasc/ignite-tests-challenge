import { Connection } from "typeorm";
import createConnection from "../../../../shared/infra/typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("GetBalanceController.spec.ts", () => {
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

  test("should get a client balance", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "admin@test.com", password: "admin" });

    const { token } = responseToken.body;

    const statementResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .send({ amount: 100, description: "Test" })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statementWithoutUserId = statementResponse.body;
    delete statementWithoutUserId.user_id;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toEqual({
      balance: 100,
      statement: [statementWithoutUserId],
    });
  });
});
