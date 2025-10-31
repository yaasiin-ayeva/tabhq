import { api } from './api';

type AppEnvironment = 'development' | 'staging' | 'production';

type AppApiKey = {
    id: string;
    key: string;
    active: boolean;
    createdAt: string;
};

export type AppItem = {
    id: string;
    name: string;
    description?: string;
    webhookUrl?: string;
    environment: AppEnvironment;
    apiKey?: AppApiKey;
    createdAt: string;
    updatedAt: string;
};

export const appsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getApps: build.query<AppItem[], void>({
            query: () => ({ url: '/apps' }),
            transformResponse: (res: any) => res?.data ?? res,
            providesTags: (result) => (
                result
                    ? [
                        ...result.map((a) => ({ type: 'Apps' as const, id: a.id })),
                        { type: 'Apps' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Apps' as const, id: 'LIST' }]
            ),
        }),
        createApp: build.mutation<AppItem, { name: string; description?: string; webhookUrl?: string; environment: AppEnvironment }>({
            query: (body) => ({ url: '/apps', method: 'POST', body }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: [{ type: 'Apps', id: 'LIST' }],
        }),
        rotateKey: build.mutation<AppItem, { appId: string }>({
            query: ({ appId }) => ({ url: `/apps/${appId}/keys/rotate`, method: 'POST' }),
            transformResponse: (res: any) => res?.data ?? res,
            invalidatesTags: (result) => (result ? [{ type: 'Apps', id: result.id }, { type: 'Apps', id: 'LIST' }] : [{ type: 'Apps', id: 'LIST' }]),
        }),
    }),
});

export const { useGetAppsQuery, useRotateKeyMutation, useCreateAppMutation } = appsApi;


