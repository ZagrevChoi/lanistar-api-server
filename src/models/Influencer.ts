import { Allow, IsEmail, IsNotEmpty } from "class-validator";

import { LSApiError, LSApiErrorCodes } from "../common";

export enum LSInfluencerContractStatus {
  WaitingToBeContacted,
  ContactedPitchBooked,
  DidntAttendPitchToBeRebooked,
  NonContactableDisappared,
  ContractSigned,
  ContractNotSigned
}

export class LSInfluencer {
  influencerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  facebook: string;
  twitter: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  brief?: string;
  referralCode: string;
  referredBy?: string;
  status: string;
  contractStatus: LSInfluencerContractStatus;
  contractSigned?: boolean;
  notAccepted?: boolean;
  contractValue?: number;
  referralValue?: number;
  token?: string;
  createdAt?: Date;
  updatedAt?: Date;
  fb_followers: number;
  instagram_followers: number;
  twitter_followers: number;
  youtube_followers: number;
  tiktok_followers: number;
  assignedto: string;
}

export class LSInfluencerRegisterReq {
  @IsNotEmpty({
    context: { code: LSApiErrorCodes.FirstNameCannotBeEmpty }
  })
  firstName: string;

  @IsNotEmpty({
    context: { code: LSApiErrorCodes.LastNameCannotBeEmpty }
  })
  lastName: string;

  @IsNotEmpty({
    context: { code: LSApiErrorCodes.EmailIsCannotBeEmpty }
  })
  @IsEmail(
    {},
    {
      context: { code: LSApiErrorCodes.EmailIsNotValid }
    }
  )
  email: string;

  @IsNotEmpty({
    context: { code: LSApiErrorCodes.EmailIsCannotBeEmpty }
  })
  phoneNumber: string;

  @Allow()
  facebook?: string;

  @Allow()
  instagram?: string;

  @Allow()
  youtube?: string;

  @Allow()
  twitter?: string;

  @Allow()
  tiktok?: string;

  @Allow()
  brief?: string;

  @Allow()
  referredBy?: string;

  @Allow()
  contractValue: number;

  @Allow()
  referralValue: number;

  @IsNotEmpty({
    context: { code: LSApiErrorCodes.RecapthcaKeyCannotBeEmpty }
  })
  recaptchaPayload: string;
}

export class LSInfluencerRegisterRes {
  errors?: LSApiError[];
  influencerInfo: {
    influencerId: string;
    referralCode: string;
  };
}

export class LSInfluencerSendMagicLinkReq {
  @IsNotEmpty({
    context: { code: LSApiErrorCodes.EmailIsCannotBeEmpty }
  })
  @IsEmail(
    {},
    {
      context: { code: LSApiErrorCodes.EmailIsNotValid }
    }
  )
  email: string;
}

export class LSInfluencerSendMagicLinkRes {
  errors?: LSApiError[];
  success: boolean;
  magicLinkReference: string;
}

export class LSInfluencerLoginReq {
  @IsNotEmpty({
    context: { code: LSApiErrorCodes.ReferenceCodeIsNotValid }
  })
  magicLinkReference: string;
}

export class LSInfluencerLoginRes {
  errors?: LSApiError[];
  influencerId: string;
  accessToken: string;
}

export class LSInfluencerListReq {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  referralCode?: string;
  referredBy?: string;
  order?: string;
  contractSigned?: string;
  notAccepted?: boolean;
  paginateNum?: any;
  searchClue?: string;
}

export class LSInfluencerGetProfileInfoRes {
  errors?: LSApiError[];
  profileInfo: LSInfluencer;
  referredInfluencers: LSInfluencer[];
}

export class LSInfluencerCreateReq {
  @IsNotEmpty({
    context: { desxription: "Firstname is requred" }
  })
  firstName: string;

  @IsNotEmpty({
    context: { desxription: "Lastname is requred" }
  })
  lastName: string;

  @IsNotEmpty({
    context: { desxription: "Email is requred" }
  })
  @IsEmail(
    {},
    {
      context: { desxription: "Email is not valid" }
    }
  )
  email: string;

  @IsNotEmpty({
    context: { desxription: "Phone number is requred" }
  })
  phoneNumber: string;

  @Allow()
  facebook?: string;

  @Allow()
  instagram?: string;

  @Allow()
  youtube?: string;

  @Allow()
  twitter?: string;

  @Allow()
  tiktok?: string;

  @Allow()
  brief?: string;

  @Allow()
  referredBy?: string;

  @Allow()
  contractValue?: number;

  @Allow()
  referralValue?: number;

  @Allow()
  contractStatus: number;

  @Allow()
  status: string;

  @Allow()
  contractSigned?: boolean;

  @Allow()
  notAccepted?: boolean;

  @Allow()
  fb_followers: number;

  @Allow()
  instagram_followers: number;

  @Allow()
  twitter_followers: number;

  @Allow()
  youtube_followers: number;

  @Allow()
  tiktok_followers: number;

  @Allow()
  assignedto: string;
}

export class LSInfluencerCreateRes {
  errors?: LSApiError[];
  profileInfo: LSInfluencer;
}

export class LSInfluencerEditReq extends LSInfluencerCreateReq {
  [x: string]: any;
  @IsNotEmpty({
    context: { desxription: "Influencer id is requred" }
  })
  influencerId: string;
  createdAt: Date;
}

export class LSInfluencerEditRes extends LSInfluencerCreateRes {}

export class LSAddReferralReq {
  @IsNotEmpty({
    context: { desxription: "Influencer id is requred" }
  })
  influencerId: string;

  @IsNotEmpty({
    context: { desxription: "Referral id is requred" }
  })
  referralId: string;
}

export class LSAddReferralRes {
  errors?: LSApiError[];
  profileInfo: LSInfluencer;
  success: boolean;
}

export class LSInfluencerInviteReq {
  @IsNotEmpty({
    context: { desxription: "Email is requred" }
  })
  @IsEmail(
    {},
    {
      context: { desxription: "Email is not valid" }
    }
  )
  email: string;
}

export class LSDashboardRes {
  total: number;
  waiting: number;
  referred: number;
  notverified: number;
  contacted: number;
  toRebook: number;
  disappeared: number;
  signed: number;
  notSigned: number;
  responseawaiting: number;
}
