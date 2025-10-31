import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { OrganizationMember } from "./organizationMember.entity";
import { AuthProvider } from "../common/enums";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    firstname!: string;

    @Column()
    lastname!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    passwordHash!: string;

    @Column({ type: "enum", enum: AuthProvider, default: AuthProvider.EMAIL })
    provider!: AuthProvider;

    @OneToMany(() => OrganizationMember, (member) => member.user)
    memberships!: OrganizationMember[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    safe() {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            provider: this.provider,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            memberships: this.memberships,
        };
    }
}
