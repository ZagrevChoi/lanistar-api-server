import {
 Connection, EntityRepository, Repository
} from "typeorm";

import {
  ContactEmailMessage, Influencer, MaillistUser,
  User
} from "./models/entities";

@EntityRepository(User)
export class UserRepository extends Repository<User> {}

export const UserRepositoryProvider = {
  provide: "UserRepository",
  useFactory: (connection: Connection) => connection.getCustomRepository(UserRepository),
  inject: [Connection]
};

export const MaillistUserRepositoryProvider = {
  provide: "MaillistUserRepository",
  useFactory: (connection: Connection) => connection.getRepository(MaillistUser),
  inject: [Connection]
};

export const ContactEmailMessageRepositoryProvider = {
  provide: "ContactEmailMessageRepository",
  useFactory: (connection: Connection) => connection.getRepository(ContactEmailMessage),
  inject: [Connection]
};

// is this necessary?
@EntityRepository(Influencer)
export class InfluencerRepository extends Repository<Influencer> {}

export const InfluencerRepositoryProvider = {
  provide: "InfluencerRepository",
  useFactory: (connection: Connection) => connection.getCustomRepository(InfluencerRepository),
  inject: [Connection]
};
