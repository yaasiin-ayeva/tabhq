import { createClient } from "redis";
import { ENV } from "./env";

let redisClient: ReturnType<typeof createClient>;

export const initRedis = async () => {
  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: ENV.REDIS.HOST,
        port: Number(ENV.REDIS.PORT),
      },
      password: ENV.REDIS.PASSWORD || undefined,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
    console.log("Redis connected");
  }

  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized.");
  }
  return redisClient;
};
