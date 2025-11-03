import dotenv from "dotenv";
dotenv.config();

export const ENV = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "4000"),

    DB: {
        HOST: process.env.DB_HOST || "localhost",
        PORT: parseInt(process.env.DB_PORT || "5432"),
        USERNAME: process.env.DB_USERNAME || "tabhq",
        PASSWORD: process.env.DB_PASSWORD || "tabhq",
        NAME: process.env.DB_NAME || "tabhq",
    },

    REDIS: {
        HOST: process.env.REDIS_HOST || "127.0.0.1",
        PORT: parseInt(process.env.REDIS_PORT || "6379"),
        PASSWORD: process.env.REDIS_PASSWORD || undefined,
    },

    JWT: {
        SECRET: process.env.JWT_SECRET || "defaultsecret",
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
        API_KEY_SECRET: process.env.JWT_API_KEY_SECRET || "defaultsecret",
    },


};
