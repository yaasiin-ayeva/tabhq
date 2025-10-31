import { api } from './api';

export type ProviderCredentials = {
    secretKey?: string;
    publicKey?: string;
    webhookSecret?: string;
    [key: string]: any;
};

export type ProviderConfig = {
    id: string;
    provider: string;
    active: boolean;
    createdAt: string;
    hasCredentials: boolean;
    credentials: ProviderCredentials;
};

export const providersApi = api.injectEndpoints({
    endpoints: (build) => ({
        getProviders: build.query<ProviderConfig[], { appId: string }>({
            query: ({ appId }) => ({ url: `/payment-config/${appId}/providers` }),
            transformResponse: (res: any) => res?.data ?? res,
            providesTags: (result, _error, { appId }) =>
                result
                    ? [
                        ...result.map((p) => ({ type: 'Providers' as const, id: `${appId}-${p.id}` })),
                        { type: 'Providers' as const, id: `LIST-${appId}` },
                    ]
                    : [{ type: 'Providers' as const, id: `LIST-${appId}` }]
        }),
        updateProviderConfig: build.mutation<ProviderConfig, {
            appId: string;
            providerId: string;
            active: boolean;
            credentials?: ProviderCredentials
        }>({
            query: ({ appId, providerId, active, credentials }) => ({
                url: `/payment-config/${appId}/providers/${providerId}`,
                method: 'PUT',
                body: { active, credentials }
            }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: (_result, _error, { appId, providerId }) => [
                { type: 'Providers', id: `${appId}-${providerId}` },
                { type: 'Providers', id: `LIST-${appId}` }
            ],
        }),
        setProviderConfig: build.mutation<ProviderConfig, {
            appId: string;
            provider: string;
            credentials: ProviderCredentials
        }>({
            query: ({ appId, provider, credentials }) => ({
                url: `/payment-config/${appId}/providers`,
                method: 'POST',
                body: { provider, credentials }
            }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: (_result, _error, { appId }) => [
                { type: 'Providers', id: `LIST-${appId}` }
            ],
        }),
    }),
});

export const {
    useGetProvidersQuery,
    useUpdateProviderConfigMutation,
    useSetProviderConfigMutation
} = providersApi;
