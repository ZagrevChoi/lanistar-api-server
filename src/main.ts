import { NestFactory } from "@nestjs/core";
import { SentryService } from "@ntegral/nestjs-sentry";

import { AppModule } from "./app.module";
import { ServerTime } from "./app.service";
import config from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe());
  if (config.env !== "development") {
    app.useLogger(app.get(SentryService));
  }

  // const origin = config.env === "production" ?
  //   (origin, callback) => {
  //     if (!origin) {
  //       callback(new Error("Missing CORS data"));
  //       return;
  //     }
  //     if (config.server.corsDomains.indexOf(origin) !== -1) {
  //       callback(null, true);
  //     } else {
  //       console.log("Unallowed domain", origin);
  //       callback(new Error("Not allowed by CORS"));
  //     }
  //   } : "*";
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true
});

  ServerTime.date = new Date();
  await app.listen(config.server.port);
}
bootstrap();
