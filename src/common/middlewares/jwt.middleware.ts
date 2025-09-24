import { Request, Response, NextFunction } from "express";
import { UsersService } from "../../auth/users.service";
import { verifyJwt } from "../helpers";

const usersService = new UsersService();

export async function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = verifyJwt(token);
    const user = await usersService.findById(payload.userId);
    if (!user) return res.status(401).json({ error: "User not found" });

    (req as any).user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
