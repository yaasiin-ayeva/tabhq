import { Router, Request, Response } from "express";
import { PaymentsService } from "../payments/payments.service";
import { ProvidersConfigService } from "../payment-config/provider-config.service";
import { getProviderInstance } from "../payments/providers/registry";
import { PaymentStatus } from "../common/enums";

const router = Router();
const paymentsService = new PaymentsService();
const providerConfigService = new ProvidersConfigService();

router.post("/",
    async (req: Request, res: Response) => {
        const event = req.body;
        const signature = req.headers["verif-hash"];

        if (!event || !event.data) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        const data = event.data;
        const txRef = data.tx_ref;

        try {

            const payment = await paymentsService.findPaymentByProviderTxnId(txRef);

            if (!payment) {
                console.warn(`Payment not found for tx_ref ${txRef}`);
                return res.status(404).json({ message: "Payment not found" });
            }

            const config = await providerConfigService.getConfig(payment.app, payment.provider);
            if (!config) {
                console.error(`No provider config found for app ${payment.app.id}`);
                return res.status(400).json({ message: "Provider config not found" });
            }

            const credentials = config.credentials as any;

            if (!signature || signature !== credentials.secretHash) {
                console.error("Invalid signature for app", payment.app.id);
                return res.status(401).json({ message: "Invalid signature" });
            }

            const provider = getProviderInstance(payment.provider);
            if (!provider || typeof provider.verifyPaymentByTxRef !== 'function') {
                throw new Error('Invalid payment provider');
            }

            provider.init({
                publicKey: credentials.publicKey,
                secretKey: credentials.secretKey,
                hookSecret: credentials.hookSecret,
            });

            const verified = await provider.verifyPaymentByTxRef(txRef);

            if (verified == true) {
                await paymentsService.updatePaymentStatus(payment, PaymentStatus.SUCCESS);
            } else {
                await paymentsService.updatePaymentStatus(payment, PaymentStatus.FAILED);
            }

            return res.status(201).json(payment.safe());
        } catch (err: any) {
            return res.status(500).json({ message: err.message });
        }
    });

export default router;
