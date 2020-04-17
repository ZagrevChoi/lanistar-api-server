import {
 HttpException, HttpStatus, Injectable
} from "@nestjs/common";

import { UserRepository } from "../data";
import { User } from "../models/entities";
import { LSLoginReq } from "../models/User";
import { encryptPassword, signToken } from "../utils";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private async validate(req: LSLoginReq): Promise<User> {
    const user = await this.findByEmail(req.email);
    if (user && user.password === encryptPassword(req.password)) {
      return user;
    }
    return null;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        email
      }
    });
  }

  public async login(req: LSLoginReq) {
    const user = await this.validate(req);
    if (!user) {
      throw new HttpException("Login error", HttpStatus.FORBIDDEN);
    }
    const accessToken = signToken({
      fullname: user.fullname,
      email: user.email
    });
    return {
      expiresIn: 3600,
      accessToken,
      statusCode: 200
    };
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = await this.userRepository.create(user);
    return await this.userRepository.save(entity);
  }
}
