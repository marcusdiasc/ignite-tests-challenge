import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("#GetBalanceUseCase", () => {
  let usersRepository: IUsersRepository;
  let statementsRepository: IStatementsRepository;
  let getBalanceUseCase: GetBalanceUseCase;

  let createUserDTO: ICreateUserDTO;
  let createStatementDTO: ICreateStatementDTO;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
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

  test("should return the balance for a valid user", async () => {
    const user = await usersRepository.create(createUserDTO);
    const expectedBalance = 1000;

    createStatementDTO.user_id = user.id!;

    await statementsRepository.create(createStatementDTO);

    createStatementDTO.amount = 200;
    createStatementDTO.type = OperationType.WITHDRAW;

    await statementsRepository.create(createStatementDTO);

    const result = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(result.balance).toEqual(expectedBalance);
  });

  test("should not return a balance for a invalid user", async () => {
    const user = await usersRepository.create(createUserDTO);
    const expectedBalance = 1000;

    createStatementDTO.user_id = user.id!;

    await statementsRepository.create(createStatementDTO);

    createStatementDTO.amount = 200;
    createStatementDTO.type = OperationType.WITHDRAW;

    await statementsRepository.create(createStatementDTO);

    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "12314" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
