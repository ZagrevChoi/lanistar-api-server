import { HttpException, HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { plainToClass } from "class-transformer";
import { Allow, IsNotEmpty, ValidationError, validate } from "class-validator";

export enum LSApiErrorCodes {
  // DB-API
  DatabaseInsertError = 1000,
  DatabaseUpdateError,
  DatabaseDeleteError,
  DatabaseError,
  UnknownError,
  UnexpectedError,
  CommunicationError,

  // Customer Id
  CustomerIdIsNotValid = 2000,
  CustomerDoesNotExist,

  // Phone
  PhoneNumberIsNotValid = 3000,
  PhoneNumberIsNotVerified,
  PhoneNumberAlreadyExists,

  // Email
  EmailIsCannotBeEmpty = 4000,
  EmailIsNotValid,
  EmailAddressAlreadyExists,

  // Personal
  FirstNameCannotBeEmpty = 5000,
  TitleCannotBeEmpty,
  LastNameCannotBeEmpty,
  DateOfBirthCannotBeEmpty,
  DateOfBirthIsNotValid,
  YouShouldBeOver18,
  GenderCannotBeEmpty,

  // Address
  BuildingNameCannotBeEmpty = 6000,
  BuildingNumberCannotBeEmpty,
  StreetNameCannotBeEmpty,
  AddressLine1CannotBeEmpty,
  PostCodeCannotBeEmpty,
  PostCodeIsNotValid,
  TownCannotBeEmpty,
  CountryCodeIsNotValid,
  CountryCodeCannotBeEmpty,

  // Social
  FacebbokProfileUrlCannotBeEmpty = 7000,
  FacebbokProfileUrlIsNotValid,
  TwitterUsernameCannotBeEmpty,
  TwitterUsernameIsNotValid,
  YoutubeChannelUrlCannotBeEmpty,
  YoutubeChannelUrlIsNotValid,
  InstagramUsernameCannotBeEmpty,
  InstagramUsernameIsNotValid,

  // Verification
  SmsVerificationCodeIsNotValid = 8000,
  EmailVerificationCodeIsNotValid,
  VerificationInfoDoesNotExist,
  VerificationInfoIsNotValid,
  YouCanRequestNVerificationCodeInOneDay,
  ReferenceCodeIsNotValid,
  YourAccountHasBeenSuspendedYouShouldWait,
  UserTokenIsNotValid,

  PleaseSelectACurrencyType = 9000,
  KycServiceResponseError,

  // ReCaptcha
  RecapthcaKeyCannotBeEmpty = 10000,
  RecapthcaKeyIsNotValid,

  // Card
  CardNumberCannotBeEmpty = 11000,
  CardNumberIsNotValid,
  CardExpiryDateCannotBeEmpty,
  CardExpiryDateNotValid,
  CardCvvCannotBeEmpty,
  CardAlreadyExists
}

export class LSApiError {
  code?: number | string | LSApiErrorCodes;
  description: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Hede {
  @Allow()
  @IsNotEmpty()
  hodo: string;
}

export const validateObjects = async (cls: any, inputData: any) => {
  const object = plainToClass<typeof cls, any>(cls, inputData);
  return await validate(object);
};

export const mapErrors = (result: ValidationError[]) => {
  const errors: LSApiError[] = [];
  // console.log(errors);
  for (let i = 0; i < result.length; i++) {
    const err = result[i];
    const vals = Object.values(err.constraints);
    const keys = Object.keys(err.constraints);
    for (let ci = 0; ci < vals.length; ci++) {
      const msg = vals[ci];
      let code = `${err.property}.${keys[ci]}`;
      // console.log(err);
      if (err.contexts && err.contexts[keys[ci]] && err.contexts[keys[ci]].code) {
        code = err.contexts[keys[ci]].code;
      }
      errors.push({
        description: msg,
        code
      });
    }
  }
  return errors;
};

export const validateInput = async (cls: any, inputData: any) => {
  const result = await validateObjects(cls, inputData);
  if (result && result.length > 0) {
    const errors = mapErrors(result);
    throw new HttpException({ errors }, HttpStatus.BAD_REQUEST);
  }
};

export const validateInputMs = async (cls: any, inputData: any) => {
  const result = await validateObjects(cls, inputData);
  if (result && result.length > 0) {
    const errors = mapErrors(result);
    throw new RpcException({ errors });
  }
};
