import {
 Column, Entity, PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class ContactEmailMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, nullable: false })
  fullName: string;

  @Column({ length: 255, nullable: false })
  email: string;

  @Column({ length: 255, nullable: false })
  phoneNumber: string;

  @Column({ length: 255, nullable: false })
  subject: string;

  @Column({ type: "text", nullable: false })
  message: string;

  @Column({default: new Date().toISOString()})
  createdAt: Date;

  @Column({default: new Date().toISOString()})
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  ip: string;
}
