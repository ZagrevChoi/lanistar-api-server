import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";

import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ApiGuard } from "../api.guard";
import { UserModule } from "../auth/user.module";
import { InfluencerRepositoryProvider, UserRepositoryProvider } from "../data";
import * as Models from "../models/entities";

export class MockedRedisService {
  getClient() {
    return {
      data: [],

      async get(key: string): Promise<any> {
        return this.data[key];
      },

      async set(key: string, data: any): Promise<any> {
        return (this.data[key] = data);
      }
    };
  }
}

export async function createTestModule(providers, controllers) {
  const dbPath = resolve("tmp");
  if (!existsSync(dbPath)) {
    mkdirSync(dbPath);
  }
  const entities = [];
  Object.getOwnPropertyNames(Models).forEach(key => entities.push(Models[key]));
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: "sqljs",
        // type: "postgres",
        // database: ":memory:",
        entities,
        synchronize: true,
        autoSave: true,
        location: resolve("tmp/data"),
        dropSchema: true
      }),
      UserModule
    ],
    providers: [...providers, UserRepositoryProvider, InfluencerRepositoryProvider, ApiGuard],
    controllers
  })
    //   .overrideProvider(RedisService).useClass(MockedRedisService)
    .compile();

  return module;
}
