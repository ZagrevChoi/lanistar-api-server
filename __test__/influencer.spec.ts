import { INestApplication } from "@nestjs/common";

import { InfluencersController } from "../src/influencers/influencers.controller";
import { InfluencersService } from "../src/influencers/influencers.service";
import { createTestModule } from "../src/test/TestModule";

describe("Influencer", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await createTestModule([InfluencersService], [InfluencersController]);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("influencer", () => {
    it("should be defined", () => {
      expect(app).toBeDefined();
    });
  });

//   describe("POST /influencer/register", () => {
//     it("should return error", async () => {
//       try {
//         const { body, status } = await request(app.getHttpServer())
//           .post("/influencer/register")
//           .send(mockedInfluencer);
//         expect(status).toBe(HttpStatus.BAD_REQUEST);
//         console.log("****", body, status);
//       } catch {}
//     });
//   });
});
