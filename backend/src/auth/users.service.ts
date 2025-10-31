import { AppDataSource } from "../config/db";
import { User } from "./user.entity";
import { Organization } from "./organization.entity";
import { OrganizationMember } from "./organizationMember.entity";
import { AuthProvider, UserRole } from "../common/enums";
import { comparePassword, hashPassword } from "../common/helpers";

export class UsersService {
  private userRepo = AppDataSource.getRepository(User);
  private orgRepo = AppDataSource.getRepository(Organization);
  private membershipRepo = AppDataSource.getRepository(OrganizationMember);

  async registerAndCreateOrg(firstname: string, lastname: string, email: string, password: string, orgName: string) {
    const existing = await this.userRepo.findOneBy({ email });
    if (existing) throw new Error("Email already registered");

    const passwordHash = await hashPassword(password);

    const org = this.orgRepo.create({ name: orgName });
    await this.orgRepo.save(org);

    const user = this.userRepo.create({
      firstname,
      lastname,
      email,
      passwordHash,
      provider: AuthProvider.EMAIL,
    });
    const savedUser = await this.userRepo.save(user);

    const membership = this.membershipRepo.create({
      organization: org,
      user: savedUser,
      role: UserRole.ADMIN,
    });
    await this.membershipRepo.save(membership);

    return { user: savedUser, organization: org };
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email }, relations: ["memberships", "memberships.organization"] });
    if (!user) return null;

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return null;

    const membership = user.memberships && user.memberships.length ? user.memberships[0] : null;
    const organization = membership ? membership.organization : null;

    return { user, organization, role: membership?.role ?? UserRole.MEMBER };
  }

  async findById(id: string) {
    return this.userRepo.findOne({ where: { id }, relations: ["memberships", "memberships.organization"] });
  }
}
