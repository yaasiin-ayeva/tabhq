import { api } from './api';

export type User = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    createdAt: string;
    updatedAt: string;
};

export type AuthResponse = {
    user: User;
    token: string;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterRequest = {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    orgName: string;
};

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            transformResponse: (res: any) => res?.data ?? res,
        }),
        register: build.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: '/auth/register',
                method: 'POST',
                body: userData,
            }),
            transformResponse: (res: any) => res?.data ?? res,
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation
} = authApi;


