import { Logger } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import {
  ContactEmailMessageRepositoryProvider,
  MaillistUserRepositoryProvider
} from "../data";
import { createTestModule } from "../test/TestModule";
import { MaillistController } from "./maillist.controller";
import { MaillistService } from "./maillist.service";

describe("MaillistController", () => {
  let maillistController: MaillistController;

  beforeAll(async () => {
    const app: TestingModule = await createTestModule(
      [MaillistService, Logger, MaillistUserRepositoryProvider, ContactEmailMessageRepositoryProvider],
      [MaillistController]
    );
    maillistController = app.get<MaillistController>(MaillistController);
  });

  it("should be defined", () => {
    expect(maillistController).toBeDefined();
  });
});
