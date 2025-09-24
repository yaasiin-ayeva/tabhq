import { AppDataSource } from "../config/db";
import { Payment } from "./payment.entity";
import { ProviderConfig } from "../payment-config/provider-config.entity";
import { getProviderInstance } from "./providers/registry";
import { App } from "../apps/app.entity";
import { PaymentStatus } from "../common/enums";

export class PaymentsService {
    private paymentRepo = AppDataSource.getRepository(Payment);

    async createPayment(
        app: App,
        providerName: string,
        amount: number,
        currency: string,
        metadata?: any
    ) {
        const configRepo = AppDataSource.getRepository(ProviderConfig);

        const config = await configRepo.findOne({
            where: { app: { id: app.id }, provider: providerName, active: true },
        });
        if (!config) throw new Error("Provider config not found");

        const provider = getProviderInstance(providerName);

        console.log("config.credentials", config.credentials);

        provider.init(config.credentials);

        const { id: providerPaymentId, status: providerStatus, redirectUrl } =
            await provider.createPayment(amount, currency, metadata);

        const status = this.mapStatus(providerStatus);

        const payment = this.paymentRepo.create({
            app,
            organization: app.organization,
            provider: providerName,
            providerPaymentId,
            amount,
            currency,
            status,
            metadata: {
                ...metadata,
                redirectUrl,
            },
        });

        return await this.paymentRepo.save(payment);
    }

    private mapStatus(providerStatus: string): PaymentStatus {
        switch (providerStatus.toLowerCase()) {
            case "succeeded":
            case "success":
            case "paid":
                return PaymentStatus.SUCCESS;

            case "pending":
            case "processing":
                return PaymentStatus.PENDING;

            case "failed":
            case "cancelled":
            case "error":
                return PaymentStatus.FAILED;

            default:
                return PaymentStatus.PENDING;
        }
    }
}
