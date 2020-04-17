import { TestingModule } from "@nestjs/testing";

import { AppController } from "./app.controller";
import { AppService, ServerTime } from "./app.service";
import { createTestModule } from "./test/TestModule";

describe("AppController", () => {
  let appController: AppController;

  beforeAll(async () => {
    const app: TestingModule = await createTestModule([AppService], [AppController]);
    appController = app.get<AppController>(AppController);
    ServerTime.date = new Date();
  });

  describe("root", () => {
    it("should return server time", async () => {
      expect(await appController.getServerTime()).toBeDefined();
    });
  });
});
