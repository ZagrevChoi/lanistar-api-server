import {
 Column, Entity, PrimaryGeneratedColumn 
} from "typeorm";

@Entity()
export class Authentication {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ length: 255 })
  code: string;

  @Column({default: new Date().toISOString()})
  createdAt: Date;

  @Column({default: new Date().toISOString()})
  updatedAt: Date;
}
