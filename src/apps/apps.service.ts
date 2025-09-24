import { AppDataSource } from "../config/db";
import { App } from "./app.entity";
import { AppApiKey } from "./appApiKey.entity";
import { randomBytes } from "crypto";
import { AuditLog } from "../common/auditLog.entity";
import { AuditAction, AppEnvironment } from "../common/enums";

export class AppsService {
    private appRepo = AppDataSource.getRepository(App);
    private apiKeyRepo = AppDataSource.getRepository(AppApiKey);
    private auditRepo = AppDataSource.getRepository(AuditLog);

    async createApp(
        organizationId: string,
        name: string,
        environment: AppEnvironment = AppEnvironment.DEVELOPMENT,
        description?: string,
        webhookUrl?: string
    ) {
        const app = this.appRepo.create({
            name,
            description,
            webhookUrl,
            environment,
            organization: { id: organizationId } as any,
        });

        await this.appRepo.save(app);
        const apiKey = await this.generateApiKey(app);
        app.apiKey = apiKey;
        await this.appRepo.save(app);

        await this.auditRepo.save(
            this.auditRepo.create({
                organizationId,
                userId: undefined,
                action: AuditAction.APP_CREATED,
                metadata: {
                    appId: app.id,
                    appName: name,
                    environment,
                    apiKeyId: apiKey.id,
                    apiKey: apiKey.key,
                },
            })
        );

        return { app, apiKey };
    }

    async generateApiKey(app: App): Promise<AppApiKey> {
        if (app.apiKey) {
            app.apiKey.active = false;
            await this.apiKeyRepo.save(app.apiKey);
        }

        const key = `tab_${randomBytes(24).toString("hex")}`;
        const apiKey = this.apiKeyRepo.create({ app, key, active: true });

        await this.apiKeyRepo.save(apiKey);

        await this.auditRepo.save(
            this.auditRepo.create({
                organizationId: app.organization.id,
                userId: undefined,
                action: AuditAction.API_KEY_ROTATED,
                metadata: { appId: app.id, keyId: apiKey.id },
            })
        );

        app.apiKey = apiKey;
        await this.appRepo.save(app);

        return apiKey;
    }

    async revokeApiKey(appId: string, organizationId: string): Promise<void> {
        const app = await this.appRepo.findOne({
            where: { id: appId, organization: { id: organizationId } },
            relations: ["apiKey", "organization"],
        });

        if (!app || !app.apiKey) {
            throw new Error("App or API key not found");
        }

        app.apiKey.active = false;
        await this.apiKeyRepo.save(app.apiKey);

        await this.auditRepo.save(
            this.auditRepo.create({
                organizationId,
                userId: undefined,
                action: AuditAction.API_KEY_ROTATED,
                metadata: { appId: app.id, keyId: app.apiKey.id },
            })
        );
    }

    async getAppsByOrganization(organizationId: string): Promise<App[]> {
        return this.appRepo.find({
            where: { organization: { id: organizationId } },
            order: { createdAt: "DESC" },
            relations: ["apiKey"],
        });
    }

    async getAppById(appId: string, organizationId: string): Promise<App | null> {
        return this.appRepo.findOne({
            where: { id: appId, organization: { id: organizationId } },
            relations: ["apiKey", "organization"],
        });
    }
}
