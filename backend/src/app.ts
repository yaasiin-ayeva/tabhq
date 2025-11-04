import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";

import appRoutes from "./apps/apps.controller";
import authRoutes from "./auth/auth.controller";
import inviteRoutes from "./auth/invite.controller";
import providerConfigRoutes from "./payment-config/provider-config.controller";
import paymentRoutes from "./payments/payments.controller";
import webhooks from "./webhooks/index.webhook";
import apiErrorHandlerMiddleware from "./common/middlewares/api-error-handler.middleware";
import morgan from "./common/morgan";

const app = express();

app.use(helmet());
app.use(cors(
    {
        origin: (origin, callback) => {
            callback(null, true);
        },
        credentials: true,
    }
));

app.use(apiErrorHandlerMiddleware);

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/invites", inviteRoutes);
app.use("/apps", appRoutes);
app.use("/payment-config", providerConfigRoutes);
app.use("/payments", paymentRoutes);
app.use("/webhooks", webhooks);

export default app;