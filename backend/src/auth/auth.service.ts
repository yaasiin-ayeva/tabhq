import { UsersService } from "./users.service";
import { AuthTokenPayload } from "../common/interfaces";
import { AuditAction } from "../common/enums";
import { AppDataSource } from "../config/db";
import { AuditLog } from "../common/auditLog.entity";
import { generateJwt } from "../common/helpers";

const usersService = new UsersService();

export class AuthService {
    async register(firstname: string, lastname: string, email: string, password: string, orgName: string) {
        const { user, organization } = await usersService.registerAndCreateOrg(firstname, lastname, email, password, orgName);

        const payload: AuthTokenPayload = {
            userId: user.id,
            organizationId: organization.id,
            role: "ADMIN",
        };
        const token = generateJwt(payload);

        // audit log
        const auditRepo = AppDataSource.getRepository(AuditLog);
        await auditRepo.save(auditRepo.create({
            organizationId: organization.id,
            userId: user.id,
            action: AuditAction.USER_REGISTERED,
            metadata: { email },
        }));

        return {
            user: user.safe(),
            token,
        };
    }

    async login(email: string, password: string) {
        const validated = await usersService.validateCredentials(email, password);
        if (!validated) throw new Error("Invalid credentials");

        const payload: AuthTokenPayload = {
            userId: validated.user.id,
            organizationId: validated.organization?.id ?? "",
            role: validated.role,
        };

        const token = generateJwt(payload);
        const auditRepo = AppDataSource.getRepository(AuditLog);

        await Promise.all([
            auditRepo.save(auditRepo.create({
                organizationId: payload.organizationId,
                userId: payload.userId,
                action: AuditAction.USER_REGISTERED,
                metadata: { email },
            })),
            auditRepo.save(auditRepo.create({
                organizationId: payload.organizationId,
                userId: payload.userId,
                action: AuditAction.USER_LOGGED_IN,
                metadata: { email },
            })),
        ]);

        return { user: validated.user.safe(), token };
    }
}
