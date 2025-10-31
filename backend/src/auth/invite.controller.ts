import { Router, Request, Response } from "express";
import { InviteService } from "./invite.service";
import { CreateInviteDto } from "./dto/invite.dto";
import { jwtAuth } from "../common/middlewares/jwt.middleware";
import { UserRole } from "../common/enums";
import { validateDto } from "../common/middlewares/validate.middleware";
import { requireRole } from "../common/middlewares/role.middleware";

const router = Router();
const inviteService = new InviteService();

router.post("/",
    jwtAuth,
    requireRole(UserRole.ADMIN),
    validateDto(CreateInviteDto),
    async (req: Request, res: Response) => {
        try {
            const dto = req.body as CreateInviteDto;
            const orgId = req.user!.memberships[0].organization.id; 
            const invite = await inviteService.createInvite(orgId, dto.email, dto.role);
            // TODO: enqueue emailWorker to send email with invite.token
            res.status(201).json({ inviteId: invite.id, email: invite.email, expiresAt: invite.expiresAt });
        } catch (err: any) {
            res.status(400).json({ error: err.message });
        }
    }
);

// accept invite (frontend calls this during signup or after login to attach existing user)
router.post("/accept/:token", async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const userId = req.body.userId;
        const result = await inviteService.acceptInvite(token, userId);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
