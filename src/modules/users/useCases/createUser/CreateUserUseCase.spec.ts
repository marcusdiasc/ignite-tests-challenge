import { hash } from "bcryptjs";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

describe("#CreateUserUseCase", () => {
  let usersRepository: IUsersRepository;
  let createUserUseCase: CreateUserUseCase;

  let createUserDTO: ICreateUserDTO;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);

    createUserDTO = {
      name: "John Doe",
      email: "john@doe.com",
      password: "1234",
    };
  });

  test("should create a new user", async () => {
    jest.spyOn(usersRepository, "create");

    const result = await createUserUseCase.execute(createUserDTO);

    expect(result).toHaveProperty("id");
    expect(usersRepository.create).toHaveBeenCalledTimes(1);
  });

  test("should not create a user if it's e-mail already exists", async () => {
    await createUserUseCase.execute(createUserDTO);

    expect(async () => {
      await createUserUseCase.execute(createUserDTO);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
