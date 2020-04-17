import { TestingModule } from "@nestjs/testing";

import { UserRepositoryProvider } from "../data";
import { createMockedUser, mockedUser } from "../test/mock";
import { createTestModule } from "../test/TestModule";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;

  beforeAll(async () => {
    const module: TestingModule = await createTestModule([UserService, UserRepositoryProvider], []);
    service = module.get<UserService>(UserService);
    await createMockedUser();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("should return successfull response", async () => {
      const resp = await service.login({
        email: "test@test.com",
        password: "securepassword"
      });
      expect(resp.statusCode).toBe(200);
    });
  });

  describe("create", () => {
    it("should throw error", async () => {
      const handler = async () => await service.create({...mockedUser, email: null });
      expect(handler()).rejects.toThrowError();
    });

    it("should return successful response", async () => {
      const resp = await service.create({...mockedUser});
      expect(resp.id).toBeDefined();
    });
  });
});
