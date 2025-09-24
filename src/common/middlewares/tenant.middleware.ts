import { Request, Response, NextFunction } from "express";

export function tenantGuard(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const membership = req.user.memberships?.[0];
    if (!membership) {
        return res.status(403).json({ error: "No organization found" });
    }

    req.organizationId = membership.organization.id;
    next();
}
