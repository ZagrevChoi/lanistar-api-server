import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { verifyToken } from "./utils";

@Injectable()
export class ApiGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request || !request.headers || !request.headers.authorization) {
      return false;
    }
    request.user = verifyToken(request.headers.authorization);
    return true;
  }
}
