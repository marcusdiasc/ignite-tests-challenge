import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

describe("#CreateStatementUseCase", () => {
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;
  let createStatementUseCase: CreateStatementUseCase;

  let createUserDTO: ICreateUserDTO;
  let createStatementDTO: ICreateStatementDTO;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
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

  test("it should create a deposit statement for a valid user", async () => {
    const user = await usersRepository.create(createUserDTO);

    createStatementDTO.user_id = user.id!;

    const result = await createStatementUseCase.execute(createStatementDTO);

    expect(result).toHaveProperty("id");
  });

  test("it should create a withdraw for a valid user if it has a sufficient balance", async () => {
    const user = await usersRepository.create(createUserDTO);

    createStatementDTO.user_id = user.id!;

    await createStatementUseCase.execute(createStatementDTO);

    createStatementDTO.type = OperationType.WITHDRAW;
    createStatementDTO.amount = 200;

    const result = await createStatementUseCase.execute(createStatementDTO);

    expect(result).toHaveProperty("id");
  });

  test("it should not create a statement for a invalid user", async () => {
    const user = await usersRepository.create(createUserDTO);

    expect(async () => {
      await createStatementUseCase.execute(createStatementDTO);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  test("it should not create a withdraw for a valid user if it doesn't has a sufficient balance", async () => {
    const user = await usersRepository.create(createUserDTO);

    createStatementDTO.user_id = user.id!;

    await createStatementUseCase.execute(createStatementDTO);

    createStatementDTO.type = OperationType.WITHDRAW;
    createStatementDTO.amount = 2000;

    expect(async () => {
      await createStatementUseCase.execute(createStatementDTO);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
