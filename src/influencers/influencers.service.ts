import {
 HttpException, HttpStatus, Injectable, Logger
} from "@nestjs/common";
import { v4 as uuid } from "uuid";

import { LSApiErrorCodes } from "../common";
import { InfluencerRepository } from "../data";
import { Influencer } from "../models/entities";
import { LSInfluencerContractStatus } from "../models/Influencer";
import { Between } from "typeorm";


export const generateRefCode = (length = 6) => {
  const chars = "QWERTYUIOPLKJHGFDSAZXCVBNM";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

@Injectable()
export class InfluencersService {
  private readonly logger = new Logger("InfluencersService");

  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async register(data: Partial<Influencer>): Promise<Influencer> {
    const exists = await this.influencerRepository.findOne({ email: data.email });
    if (exists) {
      throw new HttpException(
        {
          errors: [
            {
              code: LSApiErrorCodes.EmailAddressAlreadyExists
            }
          ]
        },
        HttpStatus.BAD_REQUEST
      );
    }

    // const existsPhone = await this.influencerRepository.findOne({ phoneNumber: data.phoneNumber });
    // if (existsPhone) {
    //   throw new HttpException(
    //     {
    //       errors: [
    //         {
    //           code: LSApiErrorCodes.PhoneNumberAlreadyExists
    //         }
    //       ]
    //     },
    //     HttpStatus.BAD_REQUEST
    //   );
    // }

    const influencer: Partial<Influencer> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      facebook: data.facebook,
      instagram: data.instagram,
      twitter: data.twitter,
      youtube: data.youtube,
      brief: data.brief,
      createdAt: new Date(),
      updatedAt: new Date(),
      referralCode: generateRefCode(8),
      contractStatus: LSInfluencerContractStatus.WaitingToBeContacted,
      token: uuid()
    };

    if (data.referredBy) {
      const referalUser = await this.influencerRepository.findOne({
        referralCode: data.referredBy
      });
      if (referalUser) {
        influencer.referredBy = referalUser.id;
      }
    }

    let result: Influencer;
    try {
      result = await this.influencerRepository.save(influencer);
    } catch (ex) {
      this.logger.log(ex);
      throw new HttpException({ errors: [{ code: LSApiErrorCodes.DatabaseInsertError }] }, HttpStatus.BAD_REQUEST);
    }
    if (!result) {
      throw new HttpException(
        {
          errors: [
            {
              code: LSApiErrorCodes.DatabaseInsertError
            }
          ]
        },
        HttpStatus.BAD_REQUEST
      );
    }
    return result;
  }

  // async setStatus(influencer: Influencer, verified: boolean): Promise<boolean> {
  //   try {
  //     const result = await this.influencerRepository.save({
  //       ...influencer,
  //       status: verified ? "1" : "0"
  //     });
  //     if (!result) {
  //       return false;
  //     }
  //     return true;
  //   } catch (error) {
  //     this.logger.error(error);
  //   }

  //   return false;
  // }

  async list(params) {
    const queryFilter: any = {
      order: {
        createdAt: "DESC"
      },
      cache: false,
    };
    const wheres = [];
    if (params.filter != '2') {
      queryFilter.take = 20;
    }
    if (params.assignedto != '-1' && params.assignedto) {
      wheres.push(`"assignedto" = ${params.assignedto}`);
    }
    switch (params.filter) {
      case '2':
        wheres.push("\"referredBy\" IS NOT NULL AND \"referredBy\" != '0'");
        break;
      case '3':
        wheres.push("\"contractStatus\" = '0'");
        break;
      case '4':
        wheres.push("\"contractStatus\" = '1'");
        break;
      case '5':
        wheres.push("\"contractStatus\" = '2'");
        break;
      case '6':
        wheres.push("\"contractStatus\" = '3'");
        break;
      case '7':
        wheres.push("\"contractStatus\" = '4'");
        break;
      case '8':
        wheres.push("\"contractStatus\" = '5'");
        break;
      case '9':
      wheres.push("\"status\" = '0'");
      break;
      default:
        break;
    }
    if (params.firstName) {
      wheres.push(`"firstName" ILIKE '%${params.firstName}%'`);
    }
    if (params.lastName) {
      wheres.push(`"lastName" ILIKE '%${params.lastName}%'`);
    }
    if (params.email) {
      wheres.push(`"email" ILIKE '%${params.email}%'`);
    }
    if (params.phoneNumber) {
      wheres.push(`"phoneNumber" ILIKE '%${params.phoneNumber}%'`);
    }
    if (params.facebook) {
      wheres.push(`"facebook" ILIKE '%${params.facebook}%'`);
    }
    if (params.instagram) {
      wheres.push(`"instagram" ILIKE '%${params.instagram}%'`);
    }
    if (params.twitter) {
      wheres.push(`"twitter" ILIKE '%${params.twitter}%'`);
    }
    if (params.youtube) {
      wheres.push(`"youtube" ILIKE '%${params.youtube}%'`);
    }
    if (params.referralCode) {
      wheres.push(`"referralCode" = '${params.referralCode}'`);
    }
    if (params.referredBy) {
      wheres.push(`"referredBy" = '${params.referredBy}'`);
    }
    if (params.notAccepted) {
      wheres.push(`"notAccepted" IS ${params.notAccepted ? "TRUE" : "FALSE"}`);
    }
    if (params.searchClue) {
      wheres.push(`lower(concat("firstName", ' '  ,"lastName")) like '%${params.searchClue}%'`);
    }
    if (wheres.length > 0) {
      queryFilter.where = wheres.join(" AND ");
    }

    if (params.order) {
      const splittedOrder = params.order.split("|");
      let sortFieldName = "createdAt";
      let sortDir = "ASC";
      if (splittedOrder.length === 2) {
        switch (sortFieldName) {
          case "createdAt":
          case "firstName":
          case "lastName":
          case "id":
            sortFieldName = splittedOrder[0];
            break;
          default:
            break;
        }
        sortDir = splittedOrder[1] === "ASC" ? "ASC" : "DESC";
      }
      queryFilter.order = {
        [sortFieldName]: sortDir
      };
    }
    queryFilter.skip = (parseInt(params.paginateNum) - 1) * queryFilter.take;
    const listResult = await this.influencerRepository.findAndCount(queryFilter);
    return listResult;
  }

  async updateStatusByID(id, contractStatus) {
    return await this.influencerRepository.update(id, {
      contractStatus
    });
  }

  async updateAssignedToByID(id, assignedto) {
    return await this.influencerRepository.update(id, {
      assignedto
    });
  }

  async getReferredInfluencersCount(refferredBy) {
    const where = `"referredBy" = '${refferredBy}'`;
    return await this.influencerRepository.count(where ? { where }: {});
  }

  async getById(id: string) {
    return await this.influencerRepository.findOne(id);
  }

  async getByToken(token: string) {
    return await this.influencerRepository.findOne({ token });
  }

  async getByEmail(email: string) {
    return await this.influencerRepository.findOne({ email });
  }

  async getByPhone(phoneNumber: string) {
    return await this.influencerRepository.findOne({ phoneNumber });
  }

  async listByReferredBy(refId: string) {
    return await this.influencerRepository.find({ referredBy: refId });
  }

  async update(infData: Partial<Influencer>) {
    const result = await this.influencerRepository.save({
      ...infData,
      updatedAt: new Date()
    });
    return result;
  }

  async create(infData: Partial<Influencer>) {
    const result = await this.influencerRepository.save({
      ...infData,
      createdAt: new Date(),
      updatedAt: new Date(),
      referralCode: generateRefCode(8),
      token: uuid()
    });
    return result;
  }

  async delete(id: string) {
    return await this.influencerRepository.delete(id);
  }

  async getSocialCounts() {
    const data = await this.influencerRepository.findAndCount({
      contractStatus: Between(4,5)
    });
    return data;
  }

  async getCount(countType) {
    let where = "";
    switch (countType) {
      case "referred":
        where = "\"referredBy\" IS NOT NULL";
        break;
      case "waiting":
        where = "\"contractStatus\" = '0'";
        break;
      case "contacted":
        where = "\"contractStatus\" = '1'";
      break;
      case "toRebook":
        where = "\"contractStatus\" = '2'";
      break;
      case "disappeared":
        where = "\"contractStatus\" = '3'";
      break;
      case "signed":
        where = "\"contractStatus\" = '4'";
      break;
      case "notSigned":
        where = "\"contractStatus\" = '5'";
      break;
      case "notverified":
        where = "\"status\" = '0'";
      break;
      default:
        break;
    }
    return await this.influencerRepository.count(where ? { where }: {});
  }
}
