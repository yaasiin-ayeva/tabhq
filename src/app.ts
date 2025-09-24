import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";

import appRoutes from "./apps/apps.controller";
import authRoutes from "./auth/auth.controller";
import inviteRoutes from "./auth/invite.controller";
import providerConfigRoutes from "./payment-config/provider-config.controller";
import paymentRoutes from "./payments/payments.controller";
import logger from "./common/logger";

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);

app.use("/invites", inviteRoutes);
app.use("/apps", appRoutes);
app.use("/payment-config", providerConfigRoutes);
app.use("/payments", paymentRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error("Request failed", {
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
    });

    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
});

export default app;