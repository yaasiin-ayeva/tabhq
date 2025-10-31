// src/payments/providers/flutterwave.provider.ts

import { BaseProvider } from "./base.provider";
const Flutterwave = require("flutterwave-node-v3");

type MobileMoneyCountry =
    | "ghana"
    | "uganda"
    | "rwanda"
    | "zambia"
    | "tanzania"
    | "franco_phone"
    | "mpesa";

type FrancophoneCountryISO =
    | "CM"  // Cameroon
    | "CI"  // Ivory Coast
    | "SN"  // Senegal
    | "ML"  // Mali
    | "TG"  // Togo
    | "BF"  // Burkina Faso
    | "BJ"  // Benin
    | "GN"  // Guinea
    | "CD"  // Democratic Republic of the Congo
    | "FR"; // France

type ExtendedMobileMoneyCountry = MobileMoneyCountry | FrancophoneCountryISO;

export class FlutterwaveProvider extends BaseProvider {
    private client!: typeof Flutterwave;
    private defaultCountry: MobileMoneyCountry = "ghana";

    private francophoneCountryMapping: Record<FrancophoneCountryISO, string> = {
        "CM": "cameroon",
        "CI": "cote_divoire",
        "SN": "senegal",
        "ML": "mali",
        "TG": "togo",
        "BF": "burkina_faso",
        "BJ": "benin",
        "GN": "guinea",
        "CD": "democratic_republic_congo",
        "FR": "france"
    };

    private francophoneCountries: Set<string> = new Set([
        "CM", "CI", "SN", "ML", "TG", "BF", "BJ", "GN", "CD", "FR"
    ]);

    init(config: Record<string, any>) {
        super.init(config);
        if (!config.publicKey || !config.secretKey) {
            throw new Error("Flutterwave requires both publicKey and secretKey");
        }
        this.client = new Flutterwave(config.publicKey, config.secretKey);
        if (config.defaultCountry) {
            this.defaultCountry = config.defaultCountry as MobileMoneyCountry;
        }
    }

    private resolveCountry(country: ExtendedMobileMoneyCountry): {
        apiCountry: MobileMoneyCountry;
        originalCountry: string;
        countryName?: string;
    } {
        if (this.francophoneCountries.has(country as string)) {
            return {
                apiCountry: "franco_phone",
                originalCountry: country,
                countryName: this.francophoneCountryMapping[country as FrancophoneCountryISO]
            };
        }

        return {
            apiCountry: country as MobileMoneyCountry,
            originalCountry: country,
        };
    }

    async createPayment(amount: number, currency: string, metadata?: any) {
        const countryInput = metadata?.country || this.defaultCountry;
        const resolvedCountry = this.resolveCountry(countryInput);

        return this.createMobileMoneyPayment(
            resolvedCountry.apiCountry,
            amount,
            currency,
            {
                ...metadata,
                country: resolvedCountry.apiCountry === "franco_phone"
                    ? resolvedCountry.originalCountry
                    : undefined
            }
        );
    }

    async capturePayment(paymentId: string) {
        const status = await this.getPaymentStatus(paymentId);
        return status === "successful";
    }

    private async createMobileMoneyPayment(
        country: MobileMoneyCountry,
        amount: number,
        currency: string,
        metadata: any
    ) {
        if (!this.client.MobileMoney[country]) {
            const supportedCountries = [
                "ghana", "uganda", "rwanda", "zambia", "tanzania", "franco_phone", "mpesa",
                ...Array.from(this.francophoneCountries)
            ].join(", ");

            throw new Error(
                `Mobile money not supported for country '${country}'. Supported: ${supportedCountries}`
            );
        }

        const txRef = metadata?.txRef || `tx-${Date.now()}`;

        const payload: any = {
            tx_ref: txRef,
            amount: amount.toString(),
            currency,
            email: metadata?.customerEmail,
            phone_number: metadata?.phoneNumber,
            fullname: metadata?.customerName,
        };

        if (country === "ghana") {
            payload.network = metadata?.network || "MTN";
        }
        if (country === "rwanda") {
            payload.order_id = metadata?.orderId;
        }
        if (country === "uganda") {
            payload.voucher = metadata?.voucher;
            payload.network = metadata?.network || "MTN";
            payload.redirect_url = metadata?.redirectUrl;
        }
        if (country === "franco_phone") {
            payload.country = metadata?.country;
        }
        if (country === "tanzania") {
            payload.network = metadata?.network || "Halopesa";
            payload.client_ip = metadata?.clientIp;
            payload.device_fingerprint = metadata?.deviceFingerprint;
        }

        const response = await this.client.MobileMoney[country](payload);

        if (response.status !== "success") {
            throw new Error(`Flutterwave error: ${response.message}`);
        }

        return {
            id: response.data?.id || response.data?.flw_ref || txRef,
            txRef,
            status: response.data?.status || response.status,
            redirectUrl:
                response.meta?.authorization?.redirect ||
                response.data?.auth_url ||
                null,
        };
    }

    async getPaymentStatus(paymentId: string) {
        const response = await this.client.Transaction.verify({ id: paymentId });

        if (response.status !== "success") {
            throw new Error(`Could not verify payment: ${response.message}`);
        }

        return response.data.status;
    }

    async refundPayment(paymentId: string, amount?: number) {
        const response = await this.client.Refund.refund({
            id: paymentId,
            amount,
        });

        if (response.status !== "success") {
            throw new Error(`Refund failed: ${response.message}`);
        }

        return true;
    }

    verifyWebhookSignature(payload: any, headers: any, secret: string) {
        const signature = headers["verif-hash"];
        if (!signature) return false;
        return signature === secret;
    }

    getSupportedFrancophoneCountries(): { iso: string, name: string }[] {
        return Object.entries(this.francophoneCountryMapping).map(([iso, name]) => ({
            iso,
            name
        }));
    }

    isFrancophoneCountry(countryCode: string): boolean {
        return this.francophoneCountries.has(countryCode);
    }

    async verifyPaymentByTxRef(txRef: string): Promise<boolean> {
        try {
            const payload = { "tx_ref": txRef };
            const response = await this.client.Transaction.verify_by_tx(payload)
            console.log(response);

            const data = response.data;
            return data && data.status === "successful";

        } catch (error) {
            console.log(error)
            throw new Error("Error verifying payment by txRef");
        }
    }
}