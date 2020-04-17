import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Request,
  UseGuards
} from "@nestjs/common";
import { v4 } from "uuid";

import { ApiGuard } from "../api.guard";
import {
 LSApiError, LSApiErrorCodes, validateInput
} from "../common";
import { Influencer } from "../models/entities";
import {
  LSAddReferralReq,
  LSAddReferralRes,
  LSDashboardRes,
  LSInfluencer,
  LSInfluencerContractStatus,
  LSInfluencerCreateReq,
  LSInfluencerCreateRes,
  LSInfluencerEditReq,
  LSInfluencerEditRes,
  LSInfluencerGetProfileInfoRes,
  LSInfluencerInviteReq,
  LSInfluencerListReq,
  LSInfluencerRegisterReq,
  LSInfluencerRegisterRes,
  LSInfluencerSendMagicLinkReq,
  LSInfluencerSendMagicLinkRes
} from "../models/Influencer";
import { getUserFromRequest } from "../utils/auth";
import getClientIp from "../utils/get-client-ip";
import {
  sendInfluencerActivateEmail,
  sendInfluencerMagiclinkEmail,
  sendInvitationToInfluencer
} from "../utils/send-email";
import validateRecaptcha from "../utils/validate-recaptcha";
import { InfluencersService } from "./influencers.service";

@Controller("influencer")
export class InfluencersController {
  private readonly logger = new Logger("InfluencersController");

  constructor(private readonly influencersService: InfluencersService) {}
  @Post("register")
  async register(@Body() posted: LSInfluencerRegisterReq, @Req() request: Request): Promise<LSInfluencerRegisterRes> {
    validateInput(LSInfluencerRegisterReq, posted);

    //@ts-ignore
    const ip = getClientIp(request);
    const capthcaResult = await validateRecaptcha(posted.recaptchaPayload, ip);
    if (!capthcaResult) {
      throw new HttpException(
        {
          errors: [
            {
              code: LSApiErrorCodes.RecapthcaKeyIsNotValid
            }
          ]
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await this.influencersService.register(posted);

    if (!result) {
      throw new HttpException(
        {
          errors: [
            {
              code: LSApiErrorCodes.DatabaseError
            }
          ]
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // send email
    const emailData = {
      firstName: posted.firstName,
      lastName: posted.lastName,
      email: posted.email,
      phoneNumber: posted.phoneNumber,
      brief: posted.brief,
      facebook: posted.facebook,
      youtube: posted.youtube,
      instagram: posted.instagram,
      twitter: posted.twitter,
      tiktok: posted.tiktok,
      activeateUrl: `https://landing-api.iamlanistar.com/influencer/toggle-status/${result.id}`
    };
    await sendInfluencerActivateEmail(emailData);

    return {
      influencerInfo: {
        influencerId: result.id,
        referralCode: result.referralCode
      }
    };
  }

  private mapInfluencer(profile: Influencer): LSInfluencer {
    return {
      influencerId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      facebook: profile.facebook,
      twitter: profile.twitter,
      instagram: profile.instagram,
      youtube: profile.youtube,
      tiktok: profile.tiktok,
      referralCode: profile.referralCode,
      contractStatus: profile.contractStatus,
      brief: profile.brief,
      referredBy: profile.referredBy,
      contractSigned: profile.contractSigned,
      notAccepted: profile.notAccepted,
      contractValue: profile.contractValue ?? 0,
      referralValue: profile.referralValue ?? 0,
      token: profile.token,
      status: profile.status,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      fb_followers: profile.fb_followers,
      instagram_followers: profile.instagram_followers,
      twitter_followers: profile.twitter_followers,
      youtube_followers: profile.youtube_followers,
      tiktok_followers: profile.tiktok_followers,
      assignedto: profile.assignedto
    };
  }

  @Post("statusChange")
  statusChange(@Body() posted): any {
    console.log(posted);
    const id  = posted.userId;
    const filter = posted.filter;
    if (!id) {
      throw new HttpException(
        {
          errors: [ 
            {
              description: "Inflencer id is missing",
              code: "id-is-required"
            } as LSApiError
          ]
        },
        HttpStatus.BAD_REQUEST
      );
    }
    if (filter === 'contractStatus') {
      const contractStatus  = posted.contract;
      this.influencersService.updateStatusByID(id, contractStatus).then((res) => {
        if (res) {
          return true;
        }
      }).catch((err) => {
        return false;
      });
    } else if (filter === 'assignedto') {
      const assignedto = posted.contract;
      this.influencersService.updateAssignedToByID(id, assignedto).then((res) => {
        if (res) {
          return true;
        }
      }).catch((err) => {
        return false;
      });
    }
  }

  @Get("profile/:token")
  async profile(@Param("token") token: string): Promise<LSInfluencerGetProfileInfoRes> {
    if (!token) {
      throw new HttpException(
        {
          errors: [
            {
              description: "Influencer token is missing",
              code: "token-is-required"
            } as LSApiError
          ]
        },
        HttpStatus.BAD_REQUEST
      );
    }
    const profile = await this.influencersService.getByToken(token);
    if (!profile) {
      return {
        errors: [
          {
            description: "Influencer info is not valid",
            code: "not-found"
          } as LSApiError
        ],
        profileInfo: null,
        referredInfluencers: []
      };
    }

    const referredBys = await this.influencersService.listByReferredBy(profile.id);
    const referredInfluencers: LSInfluencer[] = [];
    if (referredBys) {
      for (let i = 0; i < referredBys.length; i++) {
        referredBys[i].contractValue = 0;
        referredInfluencers.push(this.mapInfluencer(referredBys[i]));
      }
    }

    return {
      profileInfo: this.mapInfluencer(profile),
      referredInfluencers
    };
  }

  @Post("magiclink")
  async sendMagiclink(@Body() posted: LSInfluencerSendMagicLinkReq): Promise<LSInfluencerSendMagicLinkRes> {
    validateInput(LSInfluencerSendMagicLinkReq, posted);

    const { email } = posted;
    const influencer = await this.influencersService.getByEmail(email);
    if (!influencer) {
      return {
        errors: [
          {
            description: "This email addres does not exist",
            code: "influencer-not-found"
          } as LSApiError
        ],
        magicLinkReference: null,
        success: false
      };
    }
    if (influencer.contractStatus !== LSInfluencerContractStatus.ContractSigned) {
      console.log(influencer.contractStatus, LSInfluencerContractStatus.ContractSigned);
      throw new HttpException(
        {
          errors: [
            {
              description: "Your profile has not been verified yet",
              code: "influencer-not-verified"
            } as LSApiError
          ]
        },
        HttpStatus.FORBIDDEN
      );
    }

    const magicLinkReference = v4();
    let result: Partial<Influencer>;

    try {
      result = await this.influencersService.update({
        id: influencer.id,
        token: magicLinkReference
      });
    } catch (error) {
      this.logger.error(error);
    }
    if (result && result.id == influencer.id) {
      const magiclinkData = {
        magicLinkReference,
        email,
        magicUrl: `https://inf.iamlanistar.com/profile/${magicLinkReference}`,
        firstName: influencer.firstName,
        lastName: influencer.lastName
      };
      await sendInfluencerMagiclinkEmail(influencer.email, magiclinkData);
      return {
        magicLinkReference,
        success: true
      };
    }
    throw new HttpException(
      {
        errors: [
          {
            description: "Database error",
            code: "db-error"
          } as LSApiError
        ]
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }



  // @UseGuards(new ApiGuard())
  // @Get("toggle-status/:id")
  // async toggleStatus(@Param("id") id: string) {
  //   if (!id) {
  //     throw new HttpException(
  //       {
  //         errors: [
  //           {
  //             description: "influencer id is missing",
  //             code: "id-required"
  //           } as LSApiError
  //         ]
  //       },
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   const influencer = await this.influencersService.getById(id);
  //   if (!influencer) {
  //     throw new HttpException(
  //       {
  //         errors: [
  //           {
  //             description: "Invalid influencer id",
  //             code: "influencer-not-found"
  //           } as LSApiError
  //         ]
  //       },
  //       HttpStatus.NOT_FOUND
  //     );
  //   }

  //   const oldStatusIsVerified = influencer.status === "1";
  //   const result = await this.influencersService.setStatus(influencer, !oldStatusIsVerified);
  //   if (!result) {
  //     throw new HttpException(
  //       {
  //         errors: [
  //           {
  //             description: "Unexpected error occurred",
  //             code: "db-error"
  //           } as LSApiError
  //         ]
  //       },
  //       HttpStatus.NOT_FOUND
  //     );
  //   }

  //   return {
  //     success: true,
  //     result: oldStatusIsVerified ? "un-verified" : "verified"
  //   };
  // }

  @UseGuards(new ApiGuard())
  @Get("list")
  async list(@Query() q: any): Promise<any> {
    console.log(q);
    let result = await this.influencersService.list(q);
    if (q.filter === '2') {
      for (let i = 0; i < result[0].length; i ++) {
        result[0][i]['influencerCount'] = await this.influencersService.getReferredInfluencersCount(result[0][i].id);
      }
      await result[0].sort(this.compare);
      const paginateNum = q.paginateNum;
      let temp = [];
      for(let i = (paginateNum-1)*20 ; i < (paginateNum-1)*20 + 19; i++) {
        console.log(result[0][i]);
        if (result[0][i]) {
          temp.push(result[0][i]);
        }
      }
      return {
        list: temp,
        count: result[1]
      }
    } else {
      return {
        list: result[0],
        count: result[1]
      };
    }
  }

  compare(a, b) {
    if (a.influencerCount > b.influencerCount) return -1;
    if (b.influencerCount > a.influencerCount) return 1;
    return 0;
  }

  @UseGuards(new ApiGuard())
  @Get("info/:id")
  async info(@Param("id") id: string): Promise<LSInfluencerGetProfileInfoRes> {
    const influencer = await this.influencersService.getById(id);
    if (!influencer) {
      return {
        errors: [
          {
            description: "Influencer can not be found",
            code: "not-found"
          } as LSApiError
        ],
        profileInfo: null,
        referredInfluencers: []
      };
    }

    return {
      profileInfo: this.mapInfluencer(influencer),
      referredInfluencers: []
    };
  }

  @UseGuards(new ApiGuard())
  @Delete(":id")
  // @HttpCode(204)
  async deleteInfluencer(@Param("id") id: string): Promise<object> {
    await this.influencersService.delete(id);
    return {
      success: true
    };
  }

  @UseGuards(new ApiGuard())
  @Post("create")
  async create(@Body() posted: LSInfluencerCreateReq, @Req() request: Request): Promise<LSInfluencerCreateRes> {
    await validateInput(LSInfluencerCreateReq, posted);
    const user = getUserFromRequest(request);
    if (!user) {
      posted.contractStatus = LSInfluencerContractStatus.WaitingToBeContacted;
      posted.contractSigned = false;
      posted.contractValue = 0;
      posted.referralValue = 0;
    }

    const emailIsExists = await this.influencersService.getByEmail(posted.email);
    if (emailIsExists) {
      return {
        errors: [
          {
            description: "This email addres used by another influencer",
            code: "email-is-in-use"
          } as LSApiError
        ],
        profileInfo: null
      };
    }

    try {
      const newInfluencer = {
        firstName: posted.firstName,
        lastName: posted.lastName,
        email: posted.email,
        phoneNumber: posted.phoneNumber,
        brief: posted.brief,
        facebook: posted.facebook,
        youtube: posted.youtube,
        instagram: posted.instagram,
        twitter: posted.twitter,
        tiktok: posted.tiktok,
        referredBy: posted.referredBy,
        stacontractStatustus: posted.contractStatus,
        contractSigned: posted.contractSigned || false,
        contractValue: posted.contractValue,
        referralValue: posted.referralValue,
        notAccepted: posted.notAccepted || false
      };
      const result = await this.influencersService.create(newInfluencer);
      return {
        profileInfo: this.mapInfluencer(result)
      };
    } catch (error) {
      this.logger.error(error);
    }

    throw new HttpException(
      {
        errors: [
          {
            description: "Database error occurred",
            code: "db-error"
          } as LSApiError
        ]
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  @UseGuards(new ApiGuard())
  @Post("edit")
  async edit(@Body() posted: LSInfluencerEditReq): Promise<LSInfluencerEditRes> {
    await validateInput(LSInfluencerEditReq, posted);

    const { influencerId } = posted;
    const influencer = await this.influencersService.getById(influencerId);
    if (!influencer) {
      return {
        errors: [
          {
            description: "Influencer could not be found",
            code: "not-found"
          } as LSApiError
        ],
        profileInfo: null
      };
    }

    const emailIsExists = await this.influencersService.getByEmail(posted.email);
    if (emailIsExists && emailIsExists.id !== influencer.id) {
      return {
        errors: [
          {
            description: "This email addres used by another influencer",
            code: "email-is-in-use"
          } as LSApiError
        ],
        profileInfo: null
      };
    }

    try {
      const updatedInfluencer = {
        ...influencer,
        firstName: posted.firstName,
        lastName: posted.lastName,
        email: posted.email,
        phoneNumber: posted.phoneNumber,
        brief: posted.brief,
        facebook: posted.facebook,
        youtube: posted.youtube,
        instagram: posted.instagram,
        twitter: posted.twitter,
        tiktok: posted.tiktok,
        referredBy: posted.referredBy,
        contractStatus: posted.contractStatus,
        contractSigned: posted.contractSigned || false,
        contractValue: posted.contractValue,
        referralValue: posted.referralValue,
        notAccepted: posted.notAccepted || false,
        createdAt: posted.createdAt,
        fb_followers: posted.fb_followers,
        twitter_followers: posted.twitter_followers,
        instagram_followers: posted.instagram_followers,
        youtube_followers: posted.youtube_followers,
        tiktok_followers: posted.tiktok_followers,
        assignedto: posted.assignedto
      };
      const result = await this.influencersService.update(updatedInfluencer);
      return {
        profileInfo: this.mapInfluencer(result)
      };
    } catch (error) {
      this.logger.error(error);
    }

    throw new HttpException(
      {
        errors: [
          {
            description: "Database error occurred",
            code: "db-error"
          } as LSApiError
        ]
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  @Post("add-referral")
  async addReferral(@Body() posted: LSAddReferralReq): Promise<LSAddReferralRes> {
    await validateInput(LSAddReferralReq, posted);

    const { influencerId, referralId } = posted;

    const influencer = await this.influencersService.getById(influencerId);
    if (!influencer) {
      return {
        errors: [
          {
            description: "Influencer could not be found",
            code: "not-found"
          } as LSApiError
        ],
        profileInfo: null,
        success: false
      };
    }

    const referral = await this.influencersService.getById(referralId);
    if (!referral) {
      return {
        errors: [
          {
            description: "Influencer could not be found",
            code: "not-found"
          } as LSApiError
        ],
        profileInfo: null,
        success: false
      };
    }

    try {
      const updatedInfluencer = {
        ...referral,
        referredBy: influencerId
      };
      const result = await this.influencersService.update(updatedInfluencer);
      return {
        success: true,
        profileInfo: this.mapInfluencer(result)
      };
    } catch (error) {
      this.logger.error(error);
    }

    throw new HttpException(
      {
        errors: [
          {
            description: "Database error occurred",
            code: "db-error"
          } as LSApiError
        ]
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  @Post("invite")
  async invite(@Body() posted: LSInfluencerInviteReq) {
    await validateInput(LSInfluencerInviteReq, posted);

    const { email } = posted;

    try {
      const mailData = {
        registerLink: "https://inf.iamlanistar.com/start",
        subject: "Lets go!"
      };
      await sendInvitationToInfluencer(email, mailData);
      return {
        success: true
      };
    } catch (error) {
      this.logger.error(error);
    }

    throw new HttpException(
      {
        errors: [
          {
            description: "Email send error",
            code: "email-error"
          } as LSApiError
        ]
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  @UseGuards(new ApiGuard())
  @Get("dashboard")
  async dashboard(): Promise<LSDashboardRes> {
    const total = await this.influencersService.getCount("total");
    const referred = await this.influencersService.getCount("referred");
    const waiting = await this.influencersService.getCount("waiting");
    const notverified = await this.influencersService.getCount("notverified");
    const contacted = await this.influencersService.getCount("contacted");
    const toRebook = await this.influencersService.getCount("toRebook");
    const disappeared = await this.influencersService.getCount("disappeared");
    const signed = await this.influencersService.getCount("signed");
    const notSigned = await this.influencersService.getCount("notSigned");
    return {
      total,
      referred,
      waiting,
      notverified,
      contacted,
      toRebook,
      disappeared,
      signed,
      notSigned  
    };
  }

  @Get("socialfollowers")
  async socialfollowers(): Promise<any> {
    const social = await this.influencersService.getSocialCounts();
    let temp = {};
    let number = 0;
    for(let i = 0; i < social[0].length;  i++ ) {
      number += social[0][i].twitter_followers;
    }
    temp['twitter_total_followers'] = number;
    temp['twitter_average_followers'] = Math.round(number/social[1]);
    number = 0;

    for(let i = 0; i < social[0].length;  i++ ) {
      number += social[0][i].fb_followers;
    }
    temp['facebook_total_followers'] = number;
    temp['facebook_average_followers'] = Math.round(number/social[1]);
    number = 0;

    for(let i = 0; i < social[0].length;  i++ ) {
      number += social[0][i].youtube_followers;
    }
    temp['youtube_total_followers'] = number;
    temp['youtube_average_followers'] = Math.round(number/social[1]);
    number = 0;
    for(let i = 0; i < social[0].length;  i++ ) {
      number +=social[0][i].instagram_followers;
    }
    temp['instagram_total_followers'] = number;
    temp['instagram_average_followers'] = Math.round(number/social[1]);
    number = 0;
    for(let i = 0; i < social[0].length;  i++ ) {
      number +=social[0][i].tiktok_followers;
    }
    temp['tiktok_total_followers'] = number;
    temp['tiktok_average_followers'] = Math.round(number/social[1]);
    return temp;
  }
}
