import { IsEmail, IsNotEmpty } from "class-validator";

export class SaveMailListUserReq {
  readonly fullname?: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  readonly phoneNumber?: string;

  @IsNotEmpty()
  readonly gResponse: string;
}

export class SaveMailListUserRes {
  id: string;
  fullname?: string;
  email: string;
  phoneNumber: string;
  ip: string;
  country: string;
}
