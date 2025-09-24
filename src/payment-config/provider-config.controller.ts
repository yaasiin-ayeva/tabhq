import { Router, Request, Response } from "express";
import { jwtAuth } from "../common/middlewares/jwt.middleware";
import { tenantGuard } from "../common/middlewares/tenant.middleware";
import { requireRole } from "../common/middlewares/role.middleware";
import { UserRole } from "../common/enums";
import { AppDataSource } from "../config/db";
import { App } from "../apps/app.entity";
import { validateDto } from "../common/middlewares/validate.middleware";
import { ProvidersConfigService } from "./provider-config.service";
import { SetProviderConfigDto } from "./dto/set-provider-config.dto";
import { ProviderParamsDto } from "./dto/provider-params.dto";
import logger from "../common/logger";

const router = Router();
const configService = new ProvidersConfigService();

async function loadApp(appId: string, orgId: string): Promise<App> {
  const appRepo = AppDataSource.getRepository(App);
  const app = await appRepo.findOne({ where: { id: appId, organization: { id: orgId } } });
  if (!app) throw new Error("App not found or not in your organization");
  return app;
}

router.post(
  "/:appId/providers",
  jwtAuth,
  tenantGuard,
  requireRole(UserRole.ADMIN),
  validateDto(SetProviderConfigDto),
  async (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const { provider, credentials } = req.body;
      const orgId = req.organizationId!;

      const app = await loadApp(appId, orgId);
      const config = await configService.setConfig(app, provider, credentials);

      res.status(201).json({
        message: "Provider configuration saved successfully",
        data: config,
      });
    } catch (err: any) {
      logger.error("Create config failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * Get active provider config
 */
router.get(
  "/:appId/providers/:provider",
  jwtAuth,
  tenantGuard,
  requireRole(UserRole.ADMIN),
  validateDto(ProviderParamsDto, "params"),
  async (req: Request, res: Response) => {
    try {
      const { appId, provider } = req.params;
      const orgId = req.organizationId!;

      const app = await loadApp(appId, orgId);
      const config = await configService.getConfig(app, provider);

      if (!config)
        return res.status(404).json({ error: "Config not found" });

      res.json({
        message: "Provider configuration retrieved successfully",
        data: config,
      });
    } catch (err: any) {
      logger.error("Get config failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }
);

router.put(
  "/:appId/providers/:provider",
  jwtAuth,
  tenantGuard,
  requireRole(UserRole.ADMIN),
  validateDto(SetProviderConfigDto),
  async (req: Request, res: Response) => {
    try {
      const { appId, provider } = req.params;
      const { credentials } = req.body;
      const orgId = req.organizationId!;

      const app = await loadApp(appId, orgId);

      const existingConfig = await configService.getConfig(app, provider);
      if (!existingConfig) {
        return res.status(404).json({ error: "Config not found" });
      }

      const updatedConfig = await configService.updateConfig(app, provider, credentials);

      res.json({
        message: "Provider configuration updated successfully",
        data: updatedConfig,
      });
    } catch (err: any) {
      logger.error("Update config failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }
);


router.get(
  "/:appId/providers",
  jwtAuth,
  tenantGuard,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const orgId = req.organizationId!;

      const app = await loadApp(appId, orgId);
      const configs = await configService.listConfigs(app);

      res.json({
        message: "Provider configurations listed successfully",
        data: configs,
      });
    } catch (err: any) {
      logger.error("List configs failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }
);

router.patch(
  "/:appId/providers/:provider/deactivate",
  jwtAuth,
  tenantGuard,
  requireRole(UserRole.ADMIN),
  validateDto(ProviderParamsDto, "params"),
  async (req: Request, res: Response) => {
    try {
      const { appId, provider } = req.params;
      const orgId = req.organizationId!;

      const app = await loadApp(appId, orgId);
      const config = await configService.deactivateConfig(app, provider);

      res.json({
        message: "Provider configuration deactivated successfully",
        data: config.safe(),
      });
    } catch (err: any) {
      logger.error("Deactivate config failed", { error: err.message });
      res.status(400).json({ error: err.message });
    }
  }
);

export default router;
