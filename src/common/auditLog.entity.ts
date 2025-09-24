import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { AuditAction } from "./enums";

@Entity("audit_logs")
export class AuditLog {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    organizationId!: string;

    @Column({ nullable: true })
    userId?: string;

    @Column({ type: "enum", enum: AuditAction })
    action!: AuditAction;

    @Column({ type: "json", nullable: true })
    metadata?: Record<string, any>;

    @CreateDateColumn()
    createdAt!: Date;
}
