import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("#GetStatementOperationUseCase", () => {
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;
  let getStatementOperationUseCase: GetStatementOperationUseCase;

  let createUserDTO: ICreateUserDTO;
  let createStatementDTO: ICreateStatementDTO;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );

    createUserDTO = {
      name: "John Doe",
      email: "john@doe.com",
      password: "1234",
    };

    createStatementDTO = {
      user_id: "1234",
      amount: 1200,
      description: "test deposit",
      type: OperationType.DEPOSIT,
    };
  });

  test("should return a statement operation for a valid user", async () => {
    const user = await usersRepository.create(createUserDTO);
    createStatementDTO.user_id = user.id!;

    const statement = await statementsRepository.create(createStatementDTO);

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: statement.id!,
    });

    expect(result).toEqual(statement);
  });

  test("should not return a statement operation if user doesn't have at least one statement", async () => {
    const user = await usersRepository.create(createUserDTO);
    createStatementDTO.user_id = user.id!;

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "1234",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  test("should not return a statement operation for a invalid user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "123",
        statement_id: "1234",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
});
