import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Organization } from "./organization.entity";
import { UserRole } from "../common/enums";

@Entity("organization_members")
export class OrganizationMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Organization, (org) => org.members)
  organization!: Organization;

  @ManyToOne(() => User, (user) => user.memberships)
  user!: User;

  @Column({ type: "enum", enum: UserRole, default: UserRole.MEMBER })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
