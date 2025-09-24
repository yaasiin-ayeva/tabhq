import { IPaymentProvider } from "./provider.interface";

export abstract class BaseProvider implements IPaymentProvider {
    protected config: Record<string, any> = {};

    init(config: Record<string, any>) {
        this.config = config;
    }

    abstract createPayment(amount: number, currency: string, metadata?: any): Promise<{ id: string; status: string }>;
    abstract capturePayment(paymentId: string): Promise<boolean>;
    abstract refundPayment(paymentId: string, amount?: number): Promise<boolean>;
    abstract verifyWebhookSignature(payload: any, headers: any, secret: string): boolean;
}
