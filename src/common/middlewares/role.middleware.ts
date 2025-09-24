import { Request, Response, NextFunction } from "express";
import { UserRole } from "../enums";

export function requireRole(role: UserRole) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const memberships = req.user.memberships || [];
        const hasRole = memberships.some((m) => m.role === role);

        if (!hasRole) {
            return res.status(403).json({ error: "Forbidden: insufficient role" });
        }

        next();
    };
}
