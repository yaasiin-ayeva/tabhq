import { ProviderName, PaymentStatus } from "./enums";

export interface AuthTokenPayload {
  userId: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
}

export interface ApiKeyPayload {
  appId: string;
  organizationId: string;
}

export interface PaymentInitRequest {
  provider: ProviderName;
  amount: number;
  currency: string;
  customerId: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitResponse {
  status: PaymentStatus;
  provider: ProviderName;
  transactionId?: string;
  redirectUrl?: string;
}

export interface NormalizedWebhookEvent {
  provider: ProviderName;
  type: string; // ex: "payment.succeeded"
  transactionId: string;
  status: PaymentStatus;
  raw: any; // payload brut
}
