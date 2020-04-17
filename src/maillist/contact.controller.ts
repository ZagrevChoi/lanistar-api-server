import {
 Body, Controller,
 HttpException, HttpStatus, Logger, Post, Req
} from "@nestjs/common";
import { Request } from "express";

import { LSApiErrorCodes, validateInput } from "../common";
import { ContactEmailMessage } from "../models/entities/ContactEmailMessage";
import { SendContactMailReq } from "../models/SendMailReq";
import getClientIp from "../utils/get-client-ip";
import { sendContactEmail } from "../utils/send-email";
import validateRecaptcha from "../utils/validate-recaptcha";
import { MaillistService } from "./maillist.service";

@Controller("contact")
export class ContactController {
  constructor(
    private readonly maillistService: MaillistService,
    private readonly logger: Logger
    ) {}

  @Post("send")
  async send(@Body() posted: SendContactMailReq, @Req() request: Request) {
    await validateInput(SendContactMailReq, posted);

    const ip = getClientIp(request);
    const capthcaResult = await validateRecaptcha(posted.recaptchaPayload, ip);
    if (!capthcaResult) {
      throw new HttpException(
        {
          errors: [
            {
              code: LSApiErrorCodes.RecapthcaKeyIsNotValid,
              description: "Your session data is invalid, please refresh the page and try again"
            }
          ]
        },
        HttpStatus.BAD_REQUEST
      );
    }

    let result: ContactEmailMessage | null = null;
    try {
      result = await this.maillistService.saveContactEmail({
        ...posted,
        ip
      });
    } catch (error) {
      this.logger.log(error);
    }

    if (!result) {
      throw new HttpException(
        {
          errors: [
            {
              code: LSApiErrorCodes.DatabaseError,
              description: "Database error occrred"
            }
          ]
        },
        HttpStatus.BAD_REQUEST
      );
    }

    const tempalteData = {
      fullName: posted.fullName,
      email: posted.email,
      phoneNumber: posted.phoneNumber,
      subject: `CONTACT: ${posted.subject}`,
      message: posted.message,
      ip,
      messageReferenceId: result.id
    };
    await sendContactEmail(tempalteData);

    return {
      success: true,
      messageReferenceId: result.id
    };
  }
}
