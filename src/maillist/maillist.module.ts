import { Logger, Module } from "@nestjs/common";

import { ContactEmailMessageRepositoryProvider, MaillistUserRepositoryProvider } from "../data";
import { ContactController } from "./contact.controller";
import { MaillistController } from "./maillist.controller";
import { MaillistService } from "./maillist.service";

@Module({
  imports: [],
  controllers: [MaillistController, ContactController],
  providers: [MaillistService, Logger, MaillistUserRepositoryProvider, ContactEmailMessageRepositoryProvider]
})
export class MaillistModule {}
