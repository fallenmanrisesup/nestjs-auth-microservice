import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangedUser1613055063625 implements MigrationInterface {
    name = 'ChangedUser1613055063625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isVerified" boolean`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordCode" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emailVerificationCode" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emailVerificationCode"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordCode"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`);
    }

}
