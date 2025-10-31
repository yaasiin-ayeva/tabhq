import { AppDataSource } from "../config/db";
import { ProviderConfig } from "./provider-config.entity";
import { App } from "../apps/app.entity";

export class ProvidersConfigService {
    private repo = AppDataSource.getRepository(ProviderConfig);

    async setConfig(app: App, provider: string, credentials: Record<string, any>) {
        const configRepo = AppDataSource.getRepository(ProviderConfig);

        let config = await configRepo.findOne({
            where: { app: { id: app.id }, provider }
        });

        if (config) {
            config.credentials = credentials;
            config.active = true;
        } else {
            config = configRepo.create({
                app,
                provider,
                credentials,
                active: true,
            });
        }

        return await configRepo.save(config);
    }

    async getConfig(app: App, provider: string) {
        return this.repo.findOne({
            where: { app: { id: app.id }, provider },
        });
    }

    async deactivateConfig(app: App, provider: string) {
        const config = await this.getConfig(app, provider);
        if (!config) throw new Error("Config not found");

        config.active = false;
        return this.repo.save(config);
    }

    async listConfigs(app: App) {
        const configs = await this.repo.find({ where: { app: { id: app.id } } });
        return configs.map((c) => c);
    }
    async updateConfig(app: App, provider: string, credentials: Record<string, any>) {
        const config = await this.repo.findOne({
            where: { app: { id: app.id }, provider },
        });

        if (!config) {
            throw new Error(`Provider '${provider}' config not found for this app`);
        }

        config.credentials = credentials;
        config.active = true;

        return this.repo.save(config);
    }
}
