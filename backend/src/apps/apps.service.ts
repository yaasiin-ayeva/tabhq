import { AppDataSource } from "../config/db";
import { App } from "./app.entity";
import { AppApiKey } from "./appApiKey.entity";
import { AuditLog } from "../common/auditLog.entity";
import { AuditAction, AppEnvironment } from "../common/enums";
import { Organization } from "../auth/organization.entity";
import { ProviderConfig } from "../payment-config/provider-config.entity";
import { getAllProviderNames } from "../payments/providers/registry";
import { randomBytes } from "crypto";

export class AppsService {
    private appRepo = AppDataSource.getRepository(App);
    private apiKeyRepo = AppDataSource.getRepository(AppApiKey);
    private auditRepo = AppDataSource.getRepository(AuditLog);

    async createApp(
        orgId: string,
        name: string,
        environment: AppEnvironment,
        description?: string,
        webhookUrl?: string
    ) {
        const orgRepo = AppDataSource.getRepository(Organization);
        const appRepo = AppDataSource.getRepository(App);
        const providerConfigRepo = AppDataSource.getRepository(ProviderConfig);

        const org = await orgRepo.findOne({ where: { id: orgId } });
        if (!org) throw new Error("Organization not found");

        const app = appRepo.create({
            name,
            description,
            webhookUrl,
            environment,
            organization: org,
        });

        await appRepo.save(app);

        // Generate and associate the API key
        const apiKey = await this.generateApiKey(app);

        const providerNames = getAllProviderNames();
        const providerConfigs = providerNames.map(providerName => {
            return providerConfigRepo.create({
                app: app,
                provider: providerName,
                credentials: {},
                active: false,
            });
        });

        await providerConfigRepo.save(providerConfigs);

        return { app, apiKey };
    }

    async getAppsByOrganization(orgId: string): Promise<App[]> {
        const appRepo = AppDataSource.getRepository(App);
        return appRepo.find({
            where: { organization: { id: orgId } },
            relations: ["apiKey"],
        });
    }

    async getAppById(appId: string, orgId: string): Promise<App | null> {
        const appRepo = AppDataSource.getRepository(App);
        return appRepo.findOne({
            where: { id: appId, organization: { id: orgId } },
            relations: ["apiKey"],
        });
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
}
