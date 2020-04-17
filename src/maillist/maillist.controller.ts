import { CountryRecord } from "@maxmind/geoip2-node";
import { Body, Controller, Get, HttpStatus, Logger, Post, Req } from "@nestjs/common";
import * as Sentry from "@sentry/node";
import { Request } from "express";

import { LSApiErrorCodes } from "../common";
import { MaillistUser } from "../models/entities/MaillistUser";
import LSApiError from "../models/LSApiError";
import LSApiException from "../models/LSApiException";
import { LSGenericApiResponse } from "../models/LSGenericApiResponse";
import { SaveMailListUserReq, SaveMailListUserRes } from "../models/MailListUser";
import getClientIp from "../utils/get-client-ip";
import getCountryFromIp from "../utils/ipGeolocation";
import validateRecaptcha from "../utils/validate-recaptcha";
import { MaillistService } from "./maillist.service";

const errorDescriptions = {
  ipCanNotBeEmpty: "IP address can not be empty",
  captchaResponseNotEmpty: "Captcha response can not be empty",
  captchaValidationError: "Captcha cannot be verified",
  captchaIsNotValid: "Captcha is not valid",
  emailCanNotBeEmpty: "E-mail can not be empty",
  emailIsNotValid: "E-mail should be a valid e-mail address",
  userAlreadyExists: "This e-mail address already exists",
  phoneNumberAlreadExists: "Phone number already exists"
};

@Controller("maillist")
export class MaillistController {
  constructor(private readonly maillistService: MaillistService, private readonly logger: Logger) {
    this.logger.setContext("MaillistController");
  }

  @Get()
  getHello(): string {
    return "maillist endpoints";
  }

  @Post("save-user")
  async saveUser(
    @Body() submitted: SaveMailListUserReq,
    @Req() request: Request
  ): Promise<LSGenericApiResponse<SaveMailListUserRes>> {
    const errors: LSApiError[] = [];
    if (!submitted.email) {
      errors.push({ description: errorDescriptions.emailCanNotBeEmpty });
    } else if (submitted.email.indexOf("@") < 0) {
      errors.push({ description: errorDescriptions.emailIsNotValid });
    }
    if (!submitted.gResponse) {
      errors.push({ description: errorDescriptions.captchaResponseNotEmpty });
    }

    const ip = getClientIp(request);
    const result = await validateRecaptcha(submitted.gResponse, ip);
    if (!result) {
      errors.push({ description: errorDescriptions.captchaIsNotValid });
    }

    let country = "UK";
    try {
      const countryRes = await getCountryFromIp(ip);
      if (countryRes && countryRes.country !== {}) {
        country = (countryRes.country as CountryRecord).isoCode;
      }
    } catch (ex) {
      Sentry.captureException(ex);
      this.logger.error(ex);
    }

    // const errors = await validate(submitted);
    if (errors.length > 0) {
      throw new LSApiException(errors, HttpStatus.BAD_REQUEST);
    }

    if (submitted.phoneNumber) {
      const isPhoneNumberIsExists = await this.maillistService.findByPhoneNumber(submitted.email);
      if (isPhoneNumberIsExists && isPhoneNumberIsExists.email !== submitted.email) {
        errors.push({ description: errorDescriptions.userAlreadyExists });
      }
    }

    if (errors.length > 0) {
      throw new LSApiException(errors, HttpStatus.BAD_REQUEST);
    }

    const userEntity = {
      fullname: submitted.fullname,
      email: submitted.email,
      phoneNumber: submitted.phoneNumber,
      country,
      ip,
      updatedAt: new Date()
    };

    let updated = false;
    let savedUser: MaillistUser = await this.maillistService.findByEmail(submitted.email);
    try {
      if (savedUser) {
        const userId = savedUser.id;
        savedUser = await this.maillistService.save({
          ...userEntity,
          updatedAt: savedUser.createdAt,
          id: userId
        });
        if (!savedUser) {
          throw new LSApiException(
            [
              {
                code: LSApiErrorCodes.DatabaseUpdateError,
                description: "User can not be updated"
              }
            ],
            HttpStatus.BAD_REQUEST
          );
        }
        updated = true;
      } else {
        savedUser = await this.maillistService.save({
          ...userEntity,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (ex) {
      Sentry.captureException(ex);
      throw new LSApiException([{ code: "db", description: ex.message }], HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      result: updated ? "updated" : "created",
      payload: {
        fullname: savedUser.fullname,
        email: savedUser.email,
        phoneNumber: savedUser.phoneNumber,
        country: savedUser.country,
        ip: savedUser.ip,
        id: savedUser.id
      }
    };
  }
}
