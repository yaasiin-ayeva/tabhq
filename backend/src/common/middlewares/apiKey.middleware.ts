import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../config/db";
import { AppApiKey } from "../../apps/appApiKey.entity";

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] || req.query.apiKey;

  if (!apiKey || typeof apiKey !== "string") {
    return res.status(401).json({ error: "API key missing" });
  }

  try {
    const apiKeyRepo = AppDataSource.getRepository(AppApiKey);
    const keyEntity = await apiKeyRepo.findOne({
      where: { key: apiKey, active: true },
      relations: ["app", "app.organization"],
    });

    if (!keyEntity) {
      return res.status(403).json({ error: "Invalid or inactive API key" });
    }

    (req as any).app = keyEntity.app;
    (req as any).organization = keyEntity.app.organization;

    next();
  } catch (err) {
    console.error("API key validation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
