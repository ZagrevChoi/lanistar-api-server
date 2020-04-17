import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { UserController } from "../src/auth/user.controller";
import { UserService } from "../src/auth/user.service";
import { createMockedUser, mockedUser } from "../src/test/mock";
import { createTestModule } from "../src/test/TestModule";

describe("User", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await createTestModule([UserService], [UserController]);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST user/login", () => {
    it("should return forbidden error", () => {
      return request(app.getHttpServer())
        .post("/user/login")
        .send({
          email: "nonexistent@email.com",
          password: "none"
        })
        .expect(403);
    });

    it("should return valid token", async () => {
      await createMockedUser();
      const {
        body: { token }
      } = await request(app.getHttpServer())
        .post("/user/login")
        .send({
          email: mockedUser.email,
          password: mockedUser.password
        });
      expect(token).toBeDefined();
    });
  });

  describe("POST /user/create", () => {
    it("should return forbidden error", () => {
      return request(app.getHttpServer())
        .post("/user/create")
        .send({
          fullname: "Test User",
          email: "nonexistent@email.com",
          password: "none"
        })
        .expect(403);
    });

    it("should create a new user", async () => {
      await createMockedUser();
      const { body } = await request(app.getHttpServer())
        .post("/user/login")
        .send({
          email: mockedUser.email,
          password: mockedUser.password
        });
      const {
        body: { id }
      } = await request(app.getHttpServer())
        .post("/user/create")
        .set("Authorization", `Bearer ${body.token}`)
        .send({
          fullname: "Test User",
          email: "nonexistent@email.com",
          password: "none"
        });
      expect(id).toBeDefined();
    });
  });
});
