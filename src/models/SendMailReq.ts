import { IsEmail, IsNotEmpty } from "class-validator";

export class SendContactMailReq {
  @IsNotEmpty({
    context: {
      description: "Please enter your name"
    }
  })
  readonly fullName?: string;

  @IsNotEmpty({
    context: {
      description: "Please enter a valid email adres"
    }
  })
  @IsEmail()
  readonly email: string;

  @IsNotEmpty({
    context: {
      description: "Please enter your phone number"
    }
  })
  readonly phoneNumber?: string;

  @IsNotEmpty({
    context: {
      description: "Please enter subject of your message"
    }
  })
  readonly subject: string;

  @IsNotEmpty({
    context: {
      description: "Please enter your message"
    }
  })
  readonly message: string;

  @IsNotEmpty()
  readonly recaptchaPayload: string;
}
