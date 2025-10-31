import app from "./app";
import { AppDataSource } from "./config/db";
import { ENV } from "./config/env";
import { initRedis } from "./config/redis";

const start = async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");

        await initRedis();

        app.listen(ENV.PORT, () => {
            console.log(`Server running on http://localhost:${ENV.PORT}`);
        });
    } catch (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
};

start();
