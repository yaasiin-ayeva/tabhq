import { Router, Request, Response } from "express";
import { jwtAuth } from "../common/middlewares/jwt.middleware";
import { tenantGuard } from "../common/middlewares/tenant.middleware";
import { PaymentsService } from "./payments.service";
import { validateDto } from "../common/middlewares/validate.middleware";
import { InitPaymentDto } from "./dto/init-payment.dto";
import logger from "../common/logger";
import { apiKeyAuth } from "../common/middlewares/apiKey.middleware";

const router = Router();
const paymentsService = new PaymentsService();

router.post("/:appId/init",
    jwtAuth,
    tenantGuard,
    validateDto(InitPaymentDto),
    async (req: Request, res: Response) => {
        try {
            const { appId } = req.params;
            const { provider, amount, currency, metadata } = req.body;

            const app = { id: appId, organization: { id: req.organizationId! } } as any;

            const payment = await paymentsService.createPayment(app, provider, amount, currency, metadata);
            res.status(201).json(payment.safe());
        } catch (err: any) {
            logger.error("Init payment failed", { error: err.message });
            res.status(400).json({ error: err.message });
        }
    }
);

router.post("/pay",
    apiKeyAuth,
    validateDto(InitPaymentDto),
    async (req: Request, res: Response) => {
        try {
            const { appId } = req.params;
            const { provider, amount, currency, metadata } = req.body;

            const app = { id: appId, organization: { id: req.organizationId! } } as any;

            const payment = await paymentsService.createPayment(app, provider, amount, currency, metadata);
            res.status(201).json(payment.safe());
        } catch (err: any) {
            logger.error("Init payment failed", { error: err.message });
            res.status(400).json({ error: err.message });
        }
    }
);

export default router;
