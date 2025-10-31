import { BaseProvider } from "./base.provider";
import * as paypal from '@paypal/checkout-server-sdk';
import { AppError } from "../../common/logger";

interface PayPalConfig {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'production';
    webhookId?: string;
}

export class PayPalProvider extends BaseProvider {
    private client!: paypal.core.PayPalHttpClient;

    init(config: Record<string, any>) {
        this.config = this.validateConfig(config);

        const environment = this.config.environment === 'production'
            ? new paypal.core.LiveEnvironment(this.config.clientId, this.config.clientSecret)
            : new paypal.core.SandboxEnvironment(this.config.clientId, this.config.clientSecret);

        this.client = new paypal.core.PayPalHttpClient(environment);
    }

    private validateConfig(config: any): PayPalConfig {
        if (!config.clientId || !config.clientSecret) {
            throw new AppError('PayPal configuration is missing required credentials', 400);
        }

        return {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            environment: config.environment || 'sandbox',
            webhookId: config.webhookId
        };
    }

    async createPayment(amount: number, currency: string, metadata: any = {}) {
        try {
            const { description, returnUrl, cancelUrl } = metadata;

            if (!returnUrl || !cancelUrl) {
                throw new AppError('returnUrl and cancelUrl are required for PayPal payments', 400);
            }

            const request = new paypal.orders.OrdersCreateRequest();
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount.toString(),
                    },
                    description: description || 'Payment for goods/services',
                }],
                application_context: {
                    brand_name: metadata.brandName || 'TabHQ',
                    landing_page: 'NO_PREFERENCE',
                    user_action: 'PAY_NOW',
                    return_url: returnUrl,
                    cancel_url: cancelUrl,
                },
            });

            const response = await this.client.execute(request);

            return {
                id: response.result.id,
                status: response.result.status,
                links: response.result.links,
                redirectUrl: response.result.links.find((link: any) => link.rel === 'approve')?.href
            };
        } catch (error: any) {
            throw this.handleError(error, 'Failed to create PayPal payment');
        }
    }

    async capturePayment(orderId: string) {
        try {
            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            // TODO - add capture body if needed
            // request.requestBody({
            //     // No body needed for capture
            // });

            const response = await this.client.execute(request);

            // return {
            //     success: response.result.status === 'COMPLETED',
            //     status: response.result.status,
            //     id: response.result.id,
            //     details: response.result
            // };

            return response.result.status === 'COMPLETED';
        } catch (error: any) {
            throw this.handleError(error, 'Failed to capture PayPal payment');
        }
    }

    async refundPayment(captureId: string, amount?: number, note?: string) {
        try {
            const request = new paypal.payments.CapturesRefundRequest(captureId);

            const requestBody: any = {
                note_to_payer: note || 'Refund'
            };

            if (amount) {
                requestBody.amount = {
                    value: amount.toString(),
                    currency_code: 'USD'
                };
            }

            request.requestBody(requestBody);

            const response = await this.client.execute(request);

            // return {
            //     success: response.result.status === 'COMPLETED',
            //     status: response.result.status,
            //     id: response.result.id,
            //     details: response.result
            // };

            return response.result.status === "COMPLETED";
        } catch (error: any) {
            throw this.handleError(error, 'Failed to process PayPal refund');
        }
    }

    verifyWebhookSignature(headers: Record<string, string>, requestBody: string, webhookId?: string) {
        try {
            const webhookIdToUse = webhookId || this.config.webhookId;

            if (!webhookIdToUse) {
                throw new AppError('Webhook ID is required for signature verification', 400);
            }

            // The checkout-server-sdk does not support webhook verification, so use direct HTTP request
            const fetch = require('node-fetch');
            const basicAuth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
            const url = this.config.environment === 'production'
                ? 'https://api.paypal.com/v1/notifications/verify-webhook-signature'
                : 'https://api.sandbox.paypal.com/v1/notifications/verify-webhook-signature';

            const body = {
                auth_algo: headers['paypal-auth-algo'],
                cert_url: headers['paypal-cert-url'],
                transmission_id: headers['paypal-transmission-id'],
                transmission_sig: headers['paypal-transmission-sig'],
                transmission_time: headers['paypal-transmission-time'],
                webhook_id: webhookIdToUse,
                webhook_event: JSON.parse(requestBody)
            };

            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${basicAuth}`
                },
                body: JSON.stringify(body)
            })
                .then((res: any) => res.json())
                .then((json: any) => json.verification_status === 'SUCCESS')
                .catch(() => false);
        } catch (error) {
            throw this.handleError(error as Error, 'Failed to verify PayPal webhook signature');
        }
    }

    private handleError(error: any, defaultMessage: string): AppError {
        // Log the error with request details if available
        console.error('PayPal Error:', {
            message: error.message,
            status: error.statusCode,
            details: error.details,
            stack: error.stack
        });

        if (error.response) {
            // Handle PayPal API errors
            const { statusCode, result } = error.response;
            return new AppError(
                result?.message || defaultMessage,
                statusCode || 500,
                false
            );
        }

        // Handle other types of errors
        return new AppError(
            error.message || defaultMessage,
            error.statusCode || 500,
            false
        );
    }
}
