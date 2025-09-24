import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENV } from "./env";
import { User } from "../auth/user.entity";
import { Organization } from "../auth/organization.entity";
import { OrganizationMember } from "../auth/organizationMember.entity";
import { App } from "../apps/app.entity";
import { AppApiKey } from "../apps/appApiKey.entity";
import { AuditLog } from "../common/auditLog.entity";
import { ProviderConfig } from "../payment-config/provider-config.entity";
import { Payment } from "../payments/payment.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: ENV.DB.HOST,
    port: ENV.DB.PORT,
    username: ENV.DB.USERNAME,
    password: ENV.DB.PASSWORD,
    database: ENV.DB.NAME,
    synchronize: true,
    logging: false,
    entities: [
        User,
        Organization,
        OrganizationMember,
        App,
        AppApiKey,
        AuditLog,
        ProviderConfig,
        Payment,
    ],
    migrations: ["src/migrations/*.ts"],
});
