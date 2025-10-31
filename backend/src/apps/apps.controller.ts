import { Router, Request, Response } from "express";
import { AppsService } from "./apps.service";
import { jwtAuth } from "../common/middlewares/jwt.middleware";
import { tenantGuard } from "../common/middlewares/tenant.middleware";
import { requireRole } from "../common/middlewares/role.middleware";
import { AppEnvironment, UserRole } from "../common/enums";
import { validateDto } from "../common/middlewares/validate.middleware";
import { CreateAppDto } from "./dto/createApp.dto";
import { RotateApiKeyDto } from "./dto/rotateKey.dto";

const router = Router();
const appsService = new AppsService();

router.post("/",
    jwtAuth,
    tenantGuard,
    requireRole(UserRole.ADMIN),
    validateDto(CreateAppDto),
    async (req: Request, res: Response) => {
        console.log("create app body", req.body);

        try {
            const { name, description, environment } = req.body;
            const orgId = req.organizationId!;

            console.log("orgId", orgId);

            if (!Object.values(AppEnvironment).includes(environment)) {
                throw new Error("Invalid environment");
            }

            const { app, apiKey } = await appsService.createApp(orgId, name, environment, description);
            res.status(201).json({
                message: "App created successfully",
                data: {
                    ...app.safe(),
                    apiKey: apiKey.key
                },
            });
        } catch (err: any) {
            console.log(err);
            res.status(400).json({ error: err.message });
        }
    }
);

router.get("/", jwtAuth, tenantGuard, async (req, res) => {
    try {
        const apps = await appsService.getAppsByOrganization(req.organizationId!);
        res.status(200).json({
            message: "Apps fetched successfully",
            data: apps.map(app => app.safe())
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});


router.post("/:appId/keys/rotate",
    jwtAuth,
    tenantGuard,
    requireRole(UserRole.ADMIN),
    validateDto(RotateApiKeyDto, "params"),
    async (req: Request, res: Response) => {
        try {
            const { appId } = req.params;
            const orgId = req.organizationId!;

            const app = await appsService.getAppById(appId, orgId);
            if (!app) throw new Error("App not found");

            const apiKey = await appsService.generateApiKey(app);

            res.status(201).json({
                message: "API key rotated successfully",
                data: {
                    ...app.safe(),
                    apiKey: apiKey.key
                },
            })
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
);

// Get a single app by ID with it's providers weither added or not
router.get(
    "/:appId",
    jwtAuth,
    tenantGuard,
    async (req: Request, res: Response) => {
        try {
            const { appId } = req.params;
            const orgId = req.organizationId!;

            const app = await appsService.getAppById(appId, orgId);
            if (!app) throw new Error("App not found");

            res.status(200).json({
                message: "App fetched successfully",
                data: app.safe(),
            });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
)

export default router;
