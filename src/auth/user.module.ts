import { Module } from "@nestjs/common";

import { UserRepositoryProvider } from "../data";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  providers: [UserService, UserRepositoryProvider],
  controllers: [UserController]
})
export class UserModule {}
