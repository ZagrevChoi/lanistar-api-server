import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ContactEmailMessage } from "../models/entities/ContactEmailMessage";
import { MaillistUser } from "../models/entities/MaillistUser";

@Injectable()
export class MaillistService {
  constructor(
    @InjectRepository(MaillistUser) private readonly maillistUserRepository: Repository<MaillistUser>,
    @InjectRepository(ContactEmailMessage) private readonly contactEmailRepository: Repository<ContactEmailMessage>
  ) {}

  findAll(): Promise<MaillistUser[]> {
    return this.maillistUserRepository.find();
  }

  async save(newUser: any): Promise<MaillistUser> {
    const dbUser: MaillistUser = {
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.maillistUserRepository.save(dbUser);
  }

  findByEmail(email: string): Promise<MaillistUser> {
    return this.maillistUserRepository.findOne({ email });
  }

  findByPhoneNumber(phoneNumber: string): Promise<MaillistUser> {
    return this.maillistUserRepository.findOne({ phoneNumber });
  }

  async updateUser(updatedUserData: Partial<MaillistUser>): Promise<Partial<MaillistUser>> {
    const { id, email, fullname, phoneNumber, country, ip, updatedAt } = updatedUserData;
    const updatedResult = await this.maillistUserRepository.update(id, {
      fullname,
      email,
      phoneNumber,
      country,
      ip,
      updatedAt
    });
    return updatedResult.raw && updatedResult.raw.affectedRows === 1 ? updatedUserData : null;
  }

  async saveContactEmail(contactMessage: Partial<ContactEmailMessage>) {
    const result = await this.contactEmailRepository.save({
      ...contactMessage,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  }
}
