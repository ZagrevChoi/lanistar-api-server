import { ConnectionOptions } from "typeorm";

import config from "./config";
import * as Models from "./models/entities";

const models = [];
for (const key in Models) {
  if (Models.hasOwnProperty(key)) {
    const model = Models[key];
    models.push(model);
  }
}

const ormConfig: ConnectionOptions = {
  type: "postgres",
  database: config.postgres.db,
  host: config.postgres.host,
  port: Number(config.postgres.port),
  username: config.postgres.user,
  password: config.postgres.pass,
  entities: models,

  synchronize: process.env.NODE_ENV == "development",

  logging: false,
  logger: "simple-console",

  migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
  cli: {
    migrationsDir: "src/migrations"
  }
};

export default ormConfig;
