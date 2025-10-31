export enum UserRole {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
}

export enum AuthProvider {
    EMAIL = "EMAIL",
}

export enum ProviderName {
    STRIPE = "STRIPE",
    PAYPAL = "PAYPAL",
    MTN_MOMO = "MTN_MOMO",
}

export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

export enum AuditAction {
    USER_REGISTERED = "USER_REGISTERED",
    USER_LOGGED_IN = "USER_LOGGED_IN",
    USER_INVITED = "USER_INVITED",
    APP_CREATED = "APP_CREATED",
    API_KEY_ROTATED = "API_KEY_ROTATED",
    API_KEY_REVOKED = "API_KEY_REVOKED",
    PROVIDER_CONFIGURED = "PROVIDER_CONFIGURED",
    PAYMENT_INITIATED = "PAYMENT_INITIATED",
    PAYMENT_SUCCEEDED = "PAYMENT_SUCCEEDED",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED",
}

export enum AppEnvironment {
    DEVELOPMENT = "development",
    STAGING = "staging",
    PRODUCTION = "production",
}