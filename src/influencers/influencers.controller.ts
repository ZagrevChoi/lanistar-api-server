/* eslint-disable @typescript-eslint/camelcase */
import { get } from "http";

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
  sendInvitationToInfluencer,
  sendStatusChangeEmailToInfluencer
} from "../utils/send-email";
import validateRecaptcha from "../utils/validate-recaptcha";
import { InfluencersService } from "./influencers.service";

@Controller("influencer")
export class InfluencersController {
  private readonly logger = new Logger("InfluencersController");
  constructor(
    private readonly influencersService: InfluencersService,
  ) {}
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
      // eslint-disable-next-line @typescript-eslint/camelcase
      fb_followers: profile.fb_followers,
      // eslint-disable-next-line @typescript-eslint/camelcase
      instagram_followers: profile.instagram_followers,
      // eslint-disable-next-line @typescript-eslint/camelcase
      twitter_followers: profile.twitter_followers,
      // eslint-disable-next-line @typescript-eslint/camelcase
      youtube_followers: profile.youtube_followers,
      // eslint-disable-next-line @typescript-eslint/camelcase
      tiktok_followers: profile.tiktok_followers,
      assignedto: profile.assignedto
    };
  }

  @Post("statusChange")
  statusChange(@Body() posted): any {
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
    if (filter === "contractStatus") {
      const contractStatus  = posted.contract;
      const emailAddress = posted.email;
      let tempDateTime = new Date(posted.datetime).toUTCString();
      tempDateTime = tempDateTime.replace(",", "");
      this.influencersService.updateStatusByID(id, contractStatus).then(async (res) => {
        if (res) {
          this.influencersService.getById(id).then(async (user) => {
            if (contractStatus === 2 || contractStatus === 7 || contractStatus === 8) {
              const mailData = {
                firstName: user.firstName,
                lastName: user.lastName,
                datetime: tempDateTime
              };
              await sendStatusChangeEmailToInfluencer(emailAddress, mailData, contractStatus);
            } else if (contractStatus === 3) {
              this.influencersService.getById(user.referredBy).then(async (referrer) => {
                const mailData = {
                  influencer: {
                    firstName: user.firstName,
                    lastName: user.lastName
                  },
                  referrer: {
                    firstName: referrer.firstName,
                    lastName: referrer.lastName
                  }
                };
                await sendStatusChangeEmailToInfluencer(referrer.email, mailData, contractStatus).then((res) => {
                  console.log("Email Sent: ",res);
                });
              });
            }
          });
        }
      }).catch((err) => {
        return false;
      });
    } else if (filter === "assignedto") {
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
  @Get("allinfluencers")
  async allinfluencers(): Promise<any> {
    const result  = await this.influencersService.getAllInfluencers();
    if (result) {
      const temp = [];
      result.forEach((influencer) => {
        const res = {
          name: influencer.firstName + " " + influencer.lastName,
          email: influencer.email,
          phoneNumber: influencer.phoneNumber
        };
        temp.push(res);
      });
      return temp;
    }
  }

  @UseGuards(new ApiGuard())
  @Post("list")
  async list(@Body() posted: any): Promise<any> {
    const result = await this.influencersService.list(posted);
    if (posted.filter === 2) {
      for (let i = 0; i < result[0].length; i ++) {
        result[0][i]["influencerCount"] = await this.influencersService.getReferredInfluencersCount(result[0][i].id);
      }
      await result[0].sort(this.compare);
      const paginateNum = posted.paginateNum;
      const temp = [];
      for(let i = (paginateNum-1)*20 ; i < (paginateNum-1)*20 + 19; i++) {
        if (result[0][i]) {
          temp.push(result[0][i]);
        }
      }
      return {
        list: temp,
        count: result[1]
      };
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
    // await validateInput(LSInfluencerCreateReq, posted);
    const user = getUserFromRequest(request);
    if (!user) {
      posted.contractStatus = LSInfluencerContractStatus.WaitingToBeContacted;
      posted.contractSigned = false;
      posted.contractValue = 0;
      posted.referralValue = 0;
    }
    if (posted.email) {
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
    }
    try {
      const newInfluencer = {
        firstName: posted.firstName,
        lastName: posted.lastName,
        email: posted.email || "",
        phoneNumber: posted.phoneNumber || "",
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
        notAccepted: posted.notAccepted || false,
        assignedto: posted.assignedto || null,
        fb_followers: posted.fb_followers,
        twitter_followers: posted.twitter_followers,
        instagram_followers: posted.instagram_followers,
        youtube_followers: posted.youtube_followers,
        tiktok_followers: posted.tiktok_followers,
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
    // await validateInput(LSInfluencerEditReq, posted);

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
    if (posted.email) {
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
  @Post("dashboard")
  async dashboard(@Body() posted: any): Promise<LSDashboardRes> {
    let where = "";
    if (posted.role === 2) {
      where = `"assignedto" = '${ posted.user_id }'`;
    }
    const total = await this.influencersService.getCount("total", where);
    const referred = await this.influencersService.getCount("referred", where);
    const waiting = await this.influencersService.getCount("waiting", where);
    const notverified = await this.influencersService.getCount("notverified", where);
    const contacted = await this.influencersService.getCount("contacted", where);
    const toRebook = await this.influencersService.getCount("toRebook", where);
    const disappeared = await this.influencersService.getCount("disappeared", where);
    const signed = await this.influencersService.getCount("signed", where);
    const notSigned = await this.influencersService.getCount("notSigned", where);
    const responseawaiting = await this.influencersService.getCount("responseawaiting", where);
    return {
      total,
      referred,
      waiting,
      notverified,
      contacted,
      toRebook,
      disappeared,
      signed,
      notSigned,
      responseawaiting
    };
  }

  @Post("socialfollowers")
  async socialfollowers(@Body() posted: any): Promise<any> {
    const social = await this.influencersService.getSocialCounts(posted);
    const temp = {};
    let number = 0;
    for(let i = 0; i < social[0].length;  i++ ) {
      number +=social[0][i].instagram_followers;
    }
    temp["instagram"] = {
      total: this.kFormatter(number),
      avg: this.kFormatter(number/social[1])
    };
    number = 0;
    for(let i = 0; i < social[0].length;  i++ ) {
      number += social[0][i].fb_followers;
    }
    temp["facebook"] = {
      total: this.kFormatter(number),
      avg: this.kFormatter(number/social[1])
    };
    number = 0;

    for(let i = 0; i < social[0].length;  i++ ) {
      number += social[0][i].youtube_followers;
    }
    temp["youtube"] = {
      total: this.kFormatter(number),
      avg: this.kFormatter(number/social[1])
    };
    number = 0;
    for(let i = 0; i < social[0].length;  i++ ) {
      number += social[0][i].twitter_followers;
    }
    temp["twitter"] = {
      total: this.kFormatter(number),
      avg: this.kFormatter(number/social[1])
    };
    number = 0;
    for(let i = 0; i < social[0].length;  i++ ) {
      number +=social[0][i].tiktok_followers;
    }
    temp["tiktok"] = {
      total: this.kFormatter(number),
      avg: this.kFormatter(number/social[1])
    };
    return temp;
  }

  kFormatter(num) {
    if (Math.abs(num) > 999 && Math.abs(num) < 1000000) {
      const temp = (Math.abs(num/1000)).toFixed(1);
      return Math.abs(num) > 999 ? Math.sign(num) * parseFloat(temp) + "k" : Math.sign(num)*Math.abs(num);
    } else if (Math.abs(num) >= 1000000) {
      const temp = (Math.abs(num/1000000)).toFixed(1);
      return Math.abs(num) > 999 ? Math.sign(num) * parseFloat(temp) + "m" : Math.sign(num)*Math.abs(num);
    } else {
      return Math.round(num);
    }
  }
}
