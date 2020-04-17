// import axios from "axios";

// import config from "../config";
// import { GoogleRecaptchaResponse } from "../models/GoogleRecaptchaResponse";

export default async (gresponse: string, ip: string) => {
  // const captchaEndpoint = "https://www.google.com/recaptcha/api/siteverify";
  // const finalUrl = `${captchaEndpoint}?secret=${config.google.captchaSecet}&response=${gresponse}&remoteip=${ip}`;
  // const result = await axios.post<GoogleRecaptchaResponse>(finalUrl);
  // if (!result || !result.data || !result.data.success) {
  //   return false;
  // }
  return true;
};
