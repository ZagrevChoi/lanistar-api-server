import { createMockedUser } from "../test/mock";
import { createTestModule } from "../test/TestModule";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

describe("User Controller", () => {
  let controller: UserController;

  beforeAll(async () => {
    const module = await createTestModule([UserService], [UserController]);
    controller = module.get<UserController>(UserController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return successful token", async () => {
      await createMockedUser();
      const resp = await controller.login({
        email: "test@test.com",
        password: "securepassword"
      });
      expect(resp.token).toBeDefined();
    });

    it("should return 403 with nonexistent email", async () => {
      const handler = async () =>
        await controller.login({
          email: "non-existent@test.com",
          password: "WrongPassword"
        });
      expect(handler()).rejects.toThrowError();
    });

    it("should return 403 with wrong password", async () => {
      const handler = async () =>
        await controller.login({
          email: "test@test.com",
          password: "WrongPassword"
        });
      expect(handler()).rejects.toThrowError();
    });
  });
});
