import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Influencer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, nullable: false })
  firstName: string;

  @Column({ length: 255, nullable: false })
  lastName: string;

  @Column({ length: 255, nullable: false })
  phoneNumber: string;

  @Column({ type: "text", nullable: true })
  brief: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, nullable: true })
  facebook: string;

  @Column({ length: 255, nullable: true })
  instagram: string;

  @Column({ length: 255, nullable: true })
  twitter: string;

  @Column({ length: 255, nullable: true })
  youtube: string;

  @Column({ length: 255, nullable: true })
  tiktok: string;

  @Column({ length: 255 })
  token: string;

  @Column({ length: 100, nullable: false })
  referralCode: string;

  @Column({ length: 100, nullable: true })
  referredBy: string;

  @Column({ default: 0, nullable: true, type: "int" })
  contractValue?: number;

  @Column({ default: 0, nullable: true, type: "int" })
  referralValue?: number;

  @Column({ default: false, nullable: true, type: "boolean" })
  contractSigned?: boolean;

  @Column({ default: "1", nullable: false })
  status: string;

  @Column({ default: 0, nullable: false })
  contractStatus: number;

  @Column({ default: false, nullable: true, type: "boolean" })
  notAccepted?: boolean;

  @Column({ default: new Date().toISOString() })
  createdAt: Date;

  @Column({ default: new Date().toISOString() })
  updatedAt: Date;

  @Column({ default: 0, nullable: false })
  fb_followers: number;

  @Column({ default: 0, nullable: false })
  instagram_followers: number;

  @Column({ default: 0, nullable: false })
  twitter_followers: number;

  @Column({ default: 0, nullable: false })
  youtube_followers: number;

  @Column({ default: 0, nullable: false })
  tiktok_followers: number;

  @Column({ default: 0, nullable: false })
  assignedto: number;
}
