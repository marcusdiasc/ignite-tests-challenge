import { Connection } from "typeorm";
import createConnection from "../../../../shared/infra/typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("CreateUserController", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  test("should create a new user", async () => {
    const responseToken = await request(app)
      .post("/api/v1/users")
      .send({ name: "admin", email: "admin@test.com", password: "admin" });

    expect(responseToken.statusCode).toEqual(201);
  });

  test("should not create a new user if e-mail is already in use", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({ name: "admin", email: "admin@test.com", password: "admin" });

    const result = await request(app)
      .post("/api/v1/users")
      .send({ name: "admin", email: "admin@test.com", password: "admin" });

    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual({ message: "User already exists" });
  });
});
