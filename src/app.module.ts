import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SentryModule } from "@ntegral/nestjs-sentry";
import { LogLevel } from "@sentry/types";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./auth/user.module";
import config from "./config";
import { InfluencersModule } from "./influencers/influencers.module";
import { MaillistModule } from "./maillist/maillist.module";
import ormConfig from "./ormconfig";

export function DatabaseOrmModule(): DynamicModule {
  return TypeOrmModule.forRoot(ormConfig);
}

const dbConfig = TypeOrmModule.forRoot(ormConfig);

@Module({
  controllers: [AppController],
  imports: [
    dbConfig,
    UserModule,
    MaillistModule,
    InfluencersModule,
    SentryModule.forRoot({
      dsn: config.sentry.dsn,
      debug: true,
      environment: process.env.NODE_ENV ?? "development",
      release: null,
      logLevel: LogLevel.Debug
    })
  ],
  providers: [AppService]
})
export class AppModule {}
