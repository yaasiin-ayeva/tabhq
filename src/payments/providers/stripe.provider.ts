import Stripe from "stripe";
import { BaseProvider } from "./base.provider";

export class StripeProvider extends BaseProvider {
    private client!: Stripe;

    init(config: Record<string, any>) {
        super.init(config);
        this.client = new Stripe(
            config.secretKey
        );
    }

    async createPayment(amount: number, currency: string, metadata?: any) {
        const paymentIntent = await this.client.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata,
        });

        return { id: paymentIntent.id, status: paymentIntent.status };
    }

    async capturePayment(paymentId: string) {
        const intent = await this.client.paymentIntents.capture(paymentId);
        return intent.status === "succeeded";
    }

    async refundPayment(paymentId: string, amount?: number) {
        const refund = await this.client.refunds.create({
            payment_intent: paymentId,
            amount: amount ? Math.round(amount * 100) : undefined,
        });
        return refund.status === "succeeded";
    }

    verifyWebhookSignature(payload: any, headers: any, secret: string) {
        try {
            const sig = headers["stripe-signature"];
            this.client.webhooks.constructEvent(payload, sig, secret);
            return true;
        } catch {
            return false;
        }
    }
}
