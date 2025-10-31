import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Organization } from "./organization.entity";

@Entity("invitations")
export class Invitation {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    email!: string;

    @Column()
    token!: string;

    @Column()
    role!: string;

    @ManyToOne(() => Organization, (org) => org.id, { nullable: false })
    organization!: Organization;

    @Column({ type: "timestamptz" })
    expiresAt!: Date;

    @Column({ default: false })
    accepted!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
