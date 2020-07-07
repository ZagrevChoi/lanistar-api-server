import { getRepository } from "typeorm";
import { v4 as uuid } from "uuid";

import { User } from "../models/entities";
import { Influencer } from "../models/entities/Influencer";
import { LSInfluencerContractStatus } from "../models/Influencer";

export const mockedUser = {
  fullname: "Test User",
  email: "test@test.com",
  password: "securepassword",
  role: 1,
};

export const mockInfluencerReq = {
  firstName: "Mocked",
  lastName: "Influencer",
  phoneNumber: "020123456789",
  fullName: 'Mocked Influencer',
  brief: "Brief",
  email: "test@test.com",
  facebook: "facebook",
  instagram: "instagram",
  twitter: "twitter",
  youtube: "youtube",
  tiktok: "tiktok",
  status: "0"
};

export const mockedInfluencer: Influencer = {
  id: uuid(),
  firstName: "Mocked",
  lastName: "Influencer",
  phoneNumber: "020123456789",
  brief: "Brief",
  email: "test@test.com",
  facebook: "facebook",
  instagram: "instagram",
  twitter: "twitter",
  youtube: "youtube",
  tiktok: "tiktok",
  token: uuid(),
  referralCode: "AABBCC",
  referredBy: null,
  status: "1",
  contractStatus: LSInfluencerContractStatus.WaitingToBeContacted,
  createdAt: new Date(),
  updatedAt: new Date(),
  fb_followers: 0,
  twitter_followers: 0,
  instagram_followers: 0,
  youtube_followers: 0,
  tiktok_followers: 0,
  assignedto: 'asdfasdfasdfas'
};

export async function createMockedUser() {
  const repo = getRepository(User);
  const user = repo.create(mockedUser);
  return await repo.save(user);
}

export async function clearUsers() {
  await getRepository(User).clear();
}

export async function createMockedInfluencer(overridenProps: Partial<Influencer> = {}) {
  const repo = getRepository(Influencer);
  const user = repo.create({
    ...mockedInfluencer,
    ...overridenProps
  });
  return await repo.save(user);
}

export async function clearInfluencers() {
  await getRepository(Influencer).clear();
}
