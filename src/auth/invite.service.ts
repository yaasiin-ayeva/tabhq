import { AppDataSource } from "../config/db";
import { Invitation } from "./invite.entity";
import { Organization } from "./organization.entity";
import { OrganizationMember } from "./organizationMember.entity";
import { User } from "./user.entity";
import { UserRole, AuditAction } from "../common/enums";
import { v4 as uuidv4 } from "uuid";

export class InviteService {
    private inviteRepo = AppDataSource.getRepository(Invitation);
    private orgRepo = AppDataSource.getRepository(Organization);
    private userRepo = AppDataSource.getRepository(User);
    private membershipRepo = AppDataSource.getRepository(OrganizationMember);

    async createInvite(organizationId: string, email: string, role: UserRole, expiresHours = 48) {
        const org = await this.orgRepo.findOneBy({ id: organizationId });
        if (!org) throw new Error("Organization not found");

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

        const invite = this.inviteRepo.create({
            email,
            token,
            role,
            organization: org,
            expiresAt,
        });

        const saved = await this.inviteRepo.save(invite);

        const auditRepo = AppDataSource.getRepository("audit_logs") as any;
        await auditRepo.save(auditRepo.create({
            organizationId: organizationId,
            userId: null,
            action: AuditAction.USER_INVITED,
            metadata: { email, inviteId: saved.id },
        }));

        return saved;
    }

    async acceptInvite(token: string, userId?: string) {
        const invite = await this.inviteRepo.findOne({ where: { token }, relations: ["organization"] });
        if (!invite) throw new Error("Invalid token");
        if (invite.expiresAt < new Date()) throw new Error("Invite expired");
        if (invite.accepted) throw new Error("Invite already used");

        // if userId provided, attach 
        if (userId) {
            const user = await this.userRepo.findOneBy({ id: userId });
            if (!user) throw new Error("User not found");

            const membership = this.membershipRepo.create({
                user,
                organization: invite.organization,
                role: invite.role as UserRole,
            });
            await this.membershipRepo.save(membership);

            invite.accepted = true;
            await this.inviteRepo.save(invite);

            return { success: true, membership };
        }

        return { inviteId: invite.id, email: invite.email, orgId: invite.organization.id, role: invite.role };
    }
}
