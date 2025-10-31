import { Router, Request, Response } from "express";
import { PaymentsService } from "../payments/payments.service";
import { ProvidersConfigService } from "../payment-config/provider-config.service";
import { getProviderInstance } from "../payments/providers/registry";
import { PaymentStatus } from "../common/enums";
import axios from "axios";

const router = Router();
const paymentsService = new PaymentsService();
const providerConfigService = new ProvidersConfigService();

router.post("/", async (req: Request, res: Response) => {
    const event = req.body;
    const signature = req.headers["verif-hash"];

    if (!event?.data) {
        return res.status(400).json({ message: "Invalid payload" });
    }

    const data = event.data;
    const txRef = data.tx_ref;

    try {
        const payment = await paymentsService.findPaymentByProviderTxnId(txRef);

        if (!payment) {
            console.warn(`⚠️ Payment not found for tx_ref: ${txRef}`);
            return res.status(404).json({ message: "Payment not found" });
        }

        const config = await providerConfigService.getConfig(payment.app, payment.provider);
        if (!config) {
            console.error(`Provider config missing for app ${payment.app.id}`);
            return res.status(400).json({ message: "Provider config not found" });
        }

        const credentials = config.credentials as any;

        if (!signature || signature !== credentials.secretHash) {
            console.error("Invalid signature for app", payment.app.id);
            return res.status(401).json({ message: "Invalid signature" });
        }

        const provider = getProviderInstance(payment.provider);
        if (!provider || typeof provider.verifyPaymentByTxRef !== "function") {
            throw new Error("Invalid payment provider");
        }

        provider.init({
            publicKey: credentials.publicKey,
            secretKey: credentials.secretKey,
            hookSecret: credentials.secretHash,
        });

        const verified = await provider.verifyPaymentByTxRef(txRef);

        if (verified === true) {
            await paymentsService.updatePaymentStatus(payment, PaymentStatus.SUCCESS);
        } else {
            await paymentsService.updatePaymentStatus(payment, PaymentStatus.FAILED);
        }

        if (credentials.callbackUrl) {
            try {
                await axios.post(
                    credentials.callbackUrl,
                    {
                        txRef,
                        status: payment.status,
                        amount: payment.amount,
                        currency: payment.currency,
                    },
                    {
                        headers: {
                            "x-tabhq-signature": credentials.secretHash,
                        },
                        timeout: 5000,
                    }
                );

                console.log(`📢 Notified app ${payment.app.id} at ${credentials.callbackUrl}`);
            } catch (notifyErr: any) {
                console.error("Failed to notify app callback:", notifyErr.message);
            }
        }

        return res.status(200).json(payment.safe());
    } catch (err: any) {
        console.error("Webhook handling failed:", err);
        return res.status(500).json({ message: err.message });
    }
});

export default router;
