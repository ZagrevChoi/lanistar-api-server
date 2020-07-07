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
     console.log(JSON.stringify(result));
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

    @Get("adminList")
    async adminList(): Promise<any> {
      const result = await this.userService.getAssginUsers();
      if (result) {
        return result;
      } else {
        return null;
      }
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
       role: user.role,
       statusCode: 200
     };
   }

   
  @Get("getassginusers")
  async getAssginUsers(): Promise<any> {
    const result = await this.userService.getAssginUsers();
    if (result) {
      const temp  = [];
      result.forEach(admin => {
        const res = {
          label: admin.fullname,
          value: admin.id
        };
        temp.push(res);
      });
      return temp;
    } else {
      return null;
    }
  }

  @Post("crudUser")
  async crudUser(@Body() posted: any) {

    const temp =  {
      fullname: posted.fullname,
      password: posted.password,
      email: posted.email,
      raw_password: posted.password,
    }
    console.log(posted);
    if (posted.flag === 1) {
      this.userService.create(temp).then((res) => {
        return {
          result: res
        };
      });
    } else if (posted.flag === 2) {
      this.userService.update(posted.id, temp).then((res) => {
        return {
          result: res
        };
      });
    } else if (posted.flag === 3) {
      this.userService.delete(posted.id).then((res) => {
        return {
          result: res
        }
      })
    }
  }
}
