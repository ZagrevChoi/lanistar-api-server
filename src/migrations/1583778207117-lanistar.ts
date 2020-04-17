/* eslint-disable @typescript-eslint/class-name-casing */
import {MigrationInterface, QueryRunner} from "typeorm";

export class lanistar1583778207117 implements MigrationInterface {
    name = "lanistar1583778207117"

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE \"authentication\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"userId\" character varying NOT NULL, \"code\" character varying(255) NOT NULL, \"createdAt\" date NOT NULL, \"updatedAt\" date NOT NULL, CONSTRAINT \"PK_684fcb9924c8502d64b129cc8b1\" PRIMARY KEY (\"id\"))", undefined);
        await queryRunner.query("CREATE TABLE \"influencer\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"firstName\" character varying(255) NOT NULL, \"lastName\" character varying(255) NOT NULL, \"phoneNumber\" character varying(255) NOT NULL, \"brief\" text, \"email\" character varying(255) NOT NULL, \"facebook\" character varying(255) NOT NULL, \"instagram\" character varying(255) NOT NULL, \"twitter\" character varying(255) NOT NULL, \"youtube\" character varying(255) NOT NULL, \"token\" character varying(255) NOT NULL, \"referralCode\" character varying(100) NOT NULL, \"referredBy\" character varying(100), \"status\" character varying(20) NOT NULL, \"createdAt\" date NOT NULL, \"updatedAt\" date NOT NULL, CONSTRAINT \"PK_932fc0c1fbb494513647d1854be\" PRIMARY KEY (\"id\"))", undefined);
        await queryRunner.query("CREATE TABLE \"maillist_user\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"fullname\" character varying(255), \"email\" character varying(255) NOT NULL, \"phoneNumber\" character varying(20), \"country\" character varying, \"createdAt\" date NOT NULL, \"updatedAt\" date NOT NULL, \"ip\" character varying(255) NOT NULL, CONSTRAINT \"PK_2a380415be6477ba488aee98f6b\" PRIMARY KEY (\"id\"))", undefined);
        await queryRunner.query("CREATE TABLE \"user\" (\"id\" uuid NOT NULL DEFAULT uuid_generate_v4(), \"fullname\" character varying(255), \"email\" character varying(255) NOT NULL, \"password\" character varying(255) NOT NULL, \"createdAt\" date NOT NULL, \"updatedAt\" date NOT NULL, \"lastLoginDate\" character varying(255) NOT NULL, CONSTRAINT \"PK_cace4a159ff9f2512dd42373760\" PRIMARY KEY (\"id\"))", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE \"user\"", undefined);
        await queryRunner.query("DROP TABLE \"maillist_user\"", undefined);
        await queryRunner.query("DROP TABLE \"influencer\"", undefined);
        await queryRunner.query("DROP TABLE \"authentication\"", undefined);
    }
}
