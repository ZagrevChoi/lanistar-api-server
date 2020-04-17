import {
  Body, Controller, Get, HttpException, HttpStatus,
  Logger, Post, Req, UseGuards
 } from "@nestjs/common";

 import { ApiGuard } from "../api.guard";
 import {
  LSCreateUserReq, LSCreateUserRes, LSLoginReq, LSLoginRes
 } from "../models/User";
 import { UserService } from "./user.service";

 @Controller("user")
 export class UserController {
   private readonly logger = new Logger("UserController");

   constructor(private readonly userService: UserService) {}

   @Post("login")
   async login(@Body() req: LSLoginReq): Promise<LSLoginRes> {
     const result = await this.userService.login(req);
     return {
       token: result.accessToken
     };
   }

   @Post("logout")
   async logout(): Promise<{ success: boolean }> {
     return {
       success: true
     };
   }

   @Get("info")
   @UseGuards(new ApiGuard())
   async user(@Req() req: any): Promise<{ user: any }> {
    return {
      user: req.user
    };
   }

   @Post("create")
   @UseGuards(new ApiGuard())
   async create(@Body() req: LSCreateUserReq): Promise<LSCreateUserRes> {
     const user = await this.userService.create(req);
     if (!user) {
       throw new HttpException("Error creating user", HttpStatus.INTERNAL_SERVER_ERROR);
     }
     return {
       id: user.id,
       fullname: user.fullname,
       email: user.email,
       statusCode: 200
     };
   }
 }
