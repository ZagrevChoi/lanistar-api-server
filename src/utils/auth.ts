import { createHmac } from "crypto";

import { Request} from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

import config from "../config";

export function encryptPassword(password: string): string {
  return createHmac("sha256", password).digest("hex");
}

export function signToken(payload: string | object | Buffer): string {
  return jwt.sign(payload, config.jwt.secret);
}

export function verifyToken(authToken: string): string | object {
  if (authToken.split(" ")[0] !== "Bearer") {
    throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
  }
  const token = authToken.split(" ")[1];
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (ex) {
    const message = "Token error: " + (ex.message || ex.name);
    throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }
}

export function getUserFromRequest(request: Request): string | object {
  const req = request as any;
  if (req && req.user) {
    return req.user;
  }
  if (!req || !req.headers || !req.headers.authorization) {
    return null;
  }
  req.user = verifyToken(req.headers.authorization);
  return req.user;
}