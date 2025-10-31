import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { getRedisClient } from "../../config/redis";

let limiter: RateLimiterRedis | null = null;

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
    try {
        if (!limiter) {
            const redisClient = getRedisClient();
            limiter = new RateLimiterRedis({
                storeClient: redisClient,
                points: 100,   // max 100 requests
                duration: 60,  // per minute
                keyPrefix: "rl",
            });
        }

        const key = req.ip || "unknown";
        await limiter.consume(key);
        next();
    } catch {
        res.status(429).json({ error: "Too many requests" });
    }
}
