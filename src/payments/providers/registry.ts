import { StripeProvider } from "./stripe.provider";
import { IPaymentProvider } from "./provider.interface";
import { FlutterwaveProvider } from "./flutterwave.provider";

const registry: Record<string, new () => IPaymentProvider> = {
    stripe: StripeProvider,
    flutterwave: FlutterwaveProvider,
};

export function getProviderInstance(name: string): IPaymentProvider {
    const key = name.toLowerCase();
    const ProviderClass = registry[key];
    if (!ProviderClass) {
        throw new Error(`Provider "${name}" not supported`);
    }
    return new ProviderClass();
}
