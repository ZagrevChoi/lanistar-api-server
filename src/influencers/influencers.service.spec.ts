import { HttpException } from "@nestjs/common";

import { clearInfluencers, mockedInfluencer } from "../test/mock";
import { createTestModule } from "../test/TestModule";
import { InfluencersService } from "./influencers.service";

describe("InfluencerService", () => {
  let service: InfluencersService;

  beforeAll(async () => {
    const module = await createTestModule([InfluencersService], []);
    service = module.get<InfluencersService>(InfluencersService);
  });

  beforeEach(async () => {
    await clearInfluencers();
  });

  describe("register", () => {
    it("should create influencer successfully", async () => {
      const entity = await service.register(mockedInfluencer);
      expect(entity).toBeDefined();
      expect(entity.id).toBeDefined();
    });

    it("should throw exception with undefined phoneNumber", async () => {
      const handler = async () => await service.register({
        ...mockedInfluencer,
        phoneNumber: undefined
      });
      expect(handler()).rejects.toThrowError(HttpException);
    });

    it("should throw exception with existing email", async () => {
      await service.register(mockedInfluencer);
      const handler = async () => await service.register(mockedInfluencer);
      expect(handler()).rejects.toThrowError(HttpException);
    });

    // it("should throw exception with existing phoneNumber", async () => {
    //   await service.register(mockedInfluencer);
    //   const handler = async () => await service.register({
    //     ...mockedInfluencer,
    //     email: "test2@test2.com"
    //   });
    //   expect(handler()).rejects.toThrowError(HttpException);
    // });
  });
});
