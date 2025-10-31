import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Env } from '@/config/env';
import { getToken } from '@/utils/localstorage';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: Env.api_base_url,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set('Authorization', `Bearer ${token}`);
            headers.set('Content-Type', 'application/json');
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ['Apps', 'Auth', 'Providers'],
    endpoints: () => ({}),
});


