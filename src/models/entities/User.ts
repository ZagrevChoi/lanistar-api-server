import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, BeforeUpdate } from "typeorm";

import { encryptPassword } from "../../utils";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, nullable: true })
  fullname: string;

  @Column({ length: 255 })
  email: string;

  @Column({ default: 2, nullable: false })
  role: number;

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

  @Column({ length: 255, nullable: true})
  raw_password: string

  constructor(
    fullname: string, email: string, password: string, role?: number
  ) {
    this.fullname = fullname;
    this.email = email;
    this.password = password;
    this.raw_password = password;
    this.role = role ? role : 2;
  }
}
