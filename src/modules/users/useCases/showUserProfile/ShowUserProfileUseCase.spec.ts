import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("#ShowUserProfileUseCase", () => {
  let usersRepository: IUsersRepository;
  let createUserUseCase: CreateUserUseCase;
  let createUserDTO: ICreateUserDTO;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);

    createUserDTO = {
      name: "John Doe",
      email: "john@doe.com",
      password: "1234",
    };
  });

  test("should return the user profile for a valid user", async () => {
    const expected: User = await createUserUseCase.execute(createUserDTO);

    const result = await showUserProfileUseCase.execute(expected.id!);

    expect(result).toEqual(expected);
  });
  test("should not return a user profile for a invalid user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1234");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
