export interface IPaymentProvider {
    init(config: Record<string, any>): void;

    createPayment(
        amount: number,
        currency: string,
        metadata?: any
    ): Promise<{ id: string; status: string; redirectUrl?: string }>;

    capturePayment(paymentId: string): Promise<boolean>;
    refundPayment(paymentId: string, amount?: number): Promise<boolean>;
    verifyWebhookSignature(payload: any, headers: any, secret: string): boolean;
}
