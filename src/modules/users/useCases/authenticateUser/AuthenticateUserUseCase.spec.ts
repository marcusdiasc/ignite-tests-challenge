import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("#AuthenticateUserUseCase", () => {
  let usersRepository: IUsersRepository;
  let authenticateUserUseCase: AuthenticateUserUseCase;
  let createUserUseCase: CreateUserUseCase;
  let createUserDTO: ICreateUserDTO;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);

    createUserDTO = {
      name: "John Doe",
      email: "john@doe.com",
      password: "1234",
    };
  });

  test("should sign in a user if credentials are correct", async () => {
    await createUserUseCase.execute(createUserDTO);

    const result = await authenticateUserUseCase.execute({
      email: createUserDTO.email,
      password: createUserDTO.password,
    });

    expect(result).toHaveProperty("token");
  });

  test("should not sign in a user if e-mail doesn't exists", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: createUserDTO.email,
        password: createUserDTO.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  test("should not sign in a user with invalid  password", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: createUserDTO.email,
        password: "123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
