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
    console.log(JSON.stringify(user));
    if (!user) {
      throw new HttpException("Login error", HttpStatus.FORBIDDEN);
    }
    const accessToken = signToken({
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      id: user.id
    });
    return {
      expiresIn: 3600,
      accessToken,
      statusCode: 200
    };
  }

  async getAssginUsers() {
    const where = "role = 2";
    return await this.userRepository.find(where ? { where }: { });
  }

  async create(user: Partial<User>): Promise<User> {
    const entity = await this.userRepository.create(user);
    return await this.userRepository.save(entity);
  }

  async update(id ,user: Partial<User>): Promise<any> {
    user.password = encryptPassword(user.password);
    return await this.userRepository.update(id, user);
  }

  async delete(id): Promise<any> {
    return await this.userRepository.delete(id);
  }
}
