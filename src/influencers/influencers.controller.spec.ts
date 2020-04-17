import { INestApplication } from "@nestjs/common";
import { TestingModule } from "@nestjs/testing";

import { Influencer } from "../models/entities";
import { LSInfluencerContractStatus } from "../models/Influencer";
import {
  clearInfluencers,
  createMockedInfluencer,
  mockInfluencerReq
} from "../test/mock";
import { createTestModule } from "../test/TestModule";
import { InfluencersController } from "./influencers.controller";
import { InfluencersService } from "./influencers.service";

describe("InfluencerController", () => {
  let app: INestApplication;
  let influencerController: InfluencersController;
  process.env.NODE_ENV = "test";

  beforeAll(async () => {
    const module: TestingModule = await createTestModule([InfluencersService], [InfluencersController]);
    influencerController = module.get<InfluencersController>(InfluencersController);

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(influencerController).toBeDefined();
  });

  describe("register", () => {
    // it("should throw exception with missing fileds", async () => {
    //   return request(app.getHttpServer())
    //     .post("/influencer/register")
    //     .send({
    //       ...mockInfluencerReq,
    //       firstName: undefined,
    //       lastName: undefined
    //     }).expect(400);
    // });

    // it("should return ", async () => {
    //   const resp = await influencerController.register(
    //     {
    //       ...mockedInfluencer,
    //       recaptchaPayload: "ABC"
    //     } as LSInfluencerRegisterReq,
    //     {
    //       headers: {
    //         // "set-cookie": [""],
    //         "x-forwarded-for": "127.0.0.1"
    //       },
    //       get: () => null,
    //       accepts: () => null
    //     }
    //   );
    // });
  });

  describe("profile/:token", () => {
    it("should fail if token is missing", async () => {
      const result = influencerController.profile(undefined);
      expect(result).rejects.toThrowError();
    });

    it("should fail if token is not belonging to an influencer", async () => {
      const result = await influencerController.profile("invalid token");
      expect(result.profileInfo).toBeNull();
    });

    it("should return influencer profile info", async () => {
      const influencer = await createMockedInfluencer({
        contractStatus: LSInfluencerContractStatus.ContractSigned
      });
      const result = await influencerController.profile(influencer.token);
      expect(result.profileInfo).toBeDefined();
    });

    it("should display profile info with magic link", async () => {
      const influencer = await createMockedInfluencer({
        email: "unittesting@non-existing-domain2.com",
        contractStatus: LSInfluencerContractStatus.ContractSigned
      });
      const result = await influencerController.sendMagiclink({email: influencer.email});
      const profileResult = await influencerController.profile(result.magicLinkReference);
      expect(profileResult.profileInfo.influencerId).toBe(influencer.id);
    });
  });

  describe("magiclink ", () => {
    it("should fail with non-existing email", async () => {
      const result = await influencerController.sendMagiclink({ email: "nonexisting@email.com" });
      expect(result.errors).toBeDefined();
    });

    it("should fail with non-verified influencer", async () => {
      const influencer = await createMockedInfluencer({
        contractStatus: LSInfluencerContractStatus.WaitingToBeContacted
      });
      const result = influencerController.sendMagiclink({ email: influencer.email });
      expect(result).rejects.toThrowError();
    });

    it("should send magiclink amd return magic link reference", async () => {
      await clearInfluencers();
      const influencer = await createMockedInfluencer({
        email: "unittesting@non-existing-domain.com",
        contractStatus: LSInfluencerContractStatus.ContractSigned
      });
      const result = await influencerController.sendMagiclink({ email: influencer.email });
      expect(result.success).toBe(true);
    });
  });

  // describe("toggle-status/:id", () => {
  //   it("should fail if id is missing", async () => {
  //     const result = influencerController.toggleStatus(undefined);
  //     expect(result).rejects.toThrowError();
  //   });

  //   it("should fail if id is not belonging to an influencer", async () => {
  //     const result = influencerController.toggleStatus("not valid id");
  //     expect(result).rejects.toThrowError();
  //   });

  //   it("should set influencers's status verified", async () => {
  //     const influencer = await createMockedInfluencer({
  //       status: "0"
  //     });
  //     const result = await influencerController.toggleStatus(influencer.id);
  //     expect(result.result).toBe("verified");
  //   });

  //   it("should set influencers's status un-verified", async () => {
  //     const influencer = await createMockedInfluencer({
  //       status: "1"
  //     });
  //     const result = await influencerController.toggleStatus(influencer.id);
  //     expect(result.result).toBe("un-verified");
  //   });
  // });

  describe("list", () => {
    it("should return influencer list", async () => {
      const result = await influencerController.list(1, {});
      expect(result.list.length > 0).toBe(true);
    });
  });

  describe("info/:id ", () => {
    it("should return success", async () => {
      const influencer = await createMockedInfluencer();
      const result = await influencerController.info(influencer.id);
      expect(result.profileInfo.influencerId).toBe(influencer.id);
    });

    it("should fail with invalid id", async () => {
      const result = await influencerController.info("invalid id");
      expect(result.profileInfo).toBeNull();
    });
  });

  describe("create", () => {
    it("should return successfuly created user", async () => {
      const result = await influencerController.create({
        ...mockInfluencerReq,
        email: "newemail@new-email-doamin.com",
        phoneNumber: "+446668889944",
        contractStatus: LSInfluencerContractStatus.ContractSigned
      }, null);
      expect(result.profileInfo).toBeDefined();
    });

    it("should fail with missing fields", async () => {
      const result = influencerController.create({
        ...mockInfluencerReq,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        phoneNumber: undefined,
        contractStatus: undefined
      }, null);
      expect(result).rejects.toThrowError();
    });
  });

  describe("edit", () => {
    const updatePart = (influencer: Influencer) => ({
      influencerId: influencer.id,
      firstName: influencer.firstName + "UPDATED",
      lastName: influencer.lastName + "UPDATED",
      email: "updated@updated.com",
      phoneNumber: "+112223334455",
      status: influencer.status,
      contractStatus: LSInfluencerContractStatus.ContractSigned
    });

    it("should return successfully updated influeuncer info", async () => {
      const influencer = await createMockedInfluencer();
      const result = await influencerController.edit(updatePart(influencer));
      const {
        firstName, lastName, email,
        phoneNumber, contractStatus
      } = result.profileInfo;
      expect({
        influencerId: influencer.id,
        firstName,
        lastName,
        email,
        phoneNumber,
        status: influencer.status,
        contractStatus: contractStatus
      }).toStrictEqual(updatePart(influencer));
    });

    it("should fail with id is not belonging any existing influencer", async () => {
      const influencer = await createMockedInfluencer({
        email: "anotheruser@anotherdomain.com",
        phoneNumber: "+223334445566"
      });
      const result = await influencerController.edit({
        ...updatePart(influencer),
        influencerId: "not valid id"
      });
      expect(result.profileInfo).toBeNull();
    });
  });

  describe("add-referral", () => {
    it("should fail with id is not belonging any existing influencer", async () => {
      const influencer = await createMockedInfluencer();
      const result = await influencerController.addReferral({
        influencerId: "not valid id",
        referralId: influencer.id
      });
      expect(result.profileInfo).toBeNull();
      expect(result.success).toBe(false);
    });

    it("should return updated profile info if add referal is successfully", async () => {
      const influencer = await createMockedInfluencer();
      const influencer2 = await createMockedInfluencer();
      const result = await influencerController.addReferral({
        influencerId: influencer.id,
        referralId: influencer2.id
      });
      expect(result.profileInfo.referredBy).toBe(influencer.id);
      expect(result.success).toBe(true);
    });
  });

  describe("invite", () => {
    it("send invite email successfully", async () => {
      const result = await influencerController.invite({
        email: "testemail@test.com"
      });
      expect(result.success).toBe(true);
    });
  });

  describe("dashboard", () => {
    it("should return numbers", async () => {
      const result = await influencerController.dashboard();
      expect(result.referred).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.waiting).toBeDefined();
    });
  });
});
