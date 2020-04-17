import { HttpException, HttpStatus } from "@nestjs/common";
import { ValidationError } from "class-validator";

import LSApiError from "./LSApiError";

export default class LSApiException extends HttpException {
  readonly messages: LSApiError[];
  readonly statusCode: number;
  readonly error: string;

  constructor(messages: LSApiError[] | ValidationError[], statusCode: HttpStatus) {
    let allMessages: LSApiError[] = [];
    if (messages[0] instanceof ValidationError) {
      console.log("hede");
      for (let mi = 0; mi < messages.length; mi++) {
        const msg = messages[mi] as ValidationError;
        let ci = 1;
        for (const cKey in msg.constraints) {
          if (Object.prototype.hasOwnProperty.call(msg.constraints, cKey)) {
            const constrain = msg.constraints[cKey];
            allMessages.push({
              code: `${msg.property}-${ci}`,
              description: constrain
            });
          }
          ci++;
        }
      }
    } else {
      allMessages = [...(messages as LSApiError[])];
    }
    super(
      {
        error: "API ERROR",
        messages: allMessages,
        statusCode
      },
      statusCode
    );
  }
}
