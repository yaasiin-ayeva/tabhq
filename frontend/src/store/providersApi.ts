import { api } from './api';

export type ProviderCredentials = {
    secretKey?: string;
    publicKey?: string;
    secretHash?: string;
    callbackUrl?: string;
    apiUser?: string;
    apiKey?: string;
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
        // Récupérer tous les providers pour une app
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

        // Récupérer un provider spécifique
        getProvider: build.query<ProviderConfig, { appId: string; provider: string }>({
            query: ({ appId, provider }) => ({ url: `/payment-config/${appId}/providers/${provider}` }),
            transformResponse: (res: any) => res?.data ?? res,
            providesTags: (_result, _error, { appId, provider }) => [
                { type: 'Providers', id: `${appId}-${provider}` }
            ],
        }),

        // Créer ou mettre à jour une configuration de provider
        setProviderConfig: build.mutation<ProviderConfig, {
            appId: string;
            provider: string;
            credentials: ProviderCredentials;
        }>({
            query: ({ appId, provider, credentials }) => ({
                url: `/payment-config/${appId}/providers`,
                method: 'POST',
                body: { provider, credentials }
            }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: (_result, _error, { appId, provider }) => [
                { type: 'Providers', id: `LIST-${appId}` },
                { type: 'Providers', id: `${appId}-${provider}` }
            ],
        }),

        // Mettre à jour une configuration existante
        updateProviderConfig: build.mutation<ProviderConfig, {
            appId: string;
            provider: string;
            credentials: ProviderCredentials;
        }>({
            query: ({ appId, provider, credentials }) => ({
                url: `/payment-config/${appId}/providers/${provider}`,
                method: 'PUT',
                body: { provider, credentials }
            }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: (_result, _error, { appId, provider }) => [
                { type: 'Providers', id: `LIST-${appId}` },
                { type: 'Providers', id: `${appId}-${provider}` }
            ],
        }),

        // Désactiver un provider
        deactivateProvider: build.mutation<ProviderConfig, {
            appId: string;
            provider: string;
        }>({
            query: ({ appId, provider }) => ({
                url: `/payment-config/${appId}/providers/${provider}/deactivate`,
                method: 'PATCH',
            }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: (_result, _error, { appId, provider }) => [
                { type: 'Providers', id: `LIST-${appId}` },
                { type: 'Providers', id: `${appId}-${provider}` }
            ],
        }),
    }),
});

export const {
    useGetProvidersQuery,
    useGetProviderQuery,
    useSetProviderConfigMutation,
    useUpdateProviderConfigMutation,
    useDeactivateProviderMutation
} = providersApi;