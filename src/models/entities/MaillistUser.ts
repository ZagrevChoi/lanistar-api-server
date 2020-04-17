
import {
 Column, Entity, PrimaryGeneratedColumn 
} from "typeorm";

@Entity()
export class MaillistUser {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, nullable: true })
  fullname: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  country: string;

  @Column({default: new Date().toISOString()})
  createdAt: Date;

  @Column({default: new Date().toISOString()})
  updatedAt: Date;

  @Column({ length: 255 })
  ip: string;
}