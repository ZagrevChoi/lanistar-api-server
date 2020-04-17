import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { encryptPassword } from "../../utils";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, nullable: true })
  fullname: string;

  @Column({ length: 255 })
  email: string;

  @BeforeInsert()
  hashPassword() {
    this.password = encryptPassword(this.password);
  }
  @Column({ length: 255 })
  password: string;

  @Column({default: new Date().toISOString()})
  createdAt?: Date;

  @Column({default: new Date().toISOString()})
  updatedAt?: Date;

  @Column({ nullable: true })
  lastLoginDate?: string;
}
