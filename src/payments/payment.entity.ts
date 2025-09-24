import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Organization } from "../auth/organization.entity";
import { App } from "../apps/app.entity";
import { PaymentStatus } from "../common/enums";

@Entity("payments")
export class Payment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Organization, { onDelete: "CASCADE" })
    organization!: Organization;

    @ManyToOne(() => App, { onDelete: "CASCADE" })
    app!: App;

    @Column()
    provider!: string;

    @Column()
    providerPaymentId!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column()
    currency!: string;

    @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
    status!: PaymentStatus;

    @Column({ type: "jsonb", nullable: true })
    metadata?: any;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    safe() {
        return {
            id: this.id,
            provider: this.provider,
            providerPaymentId: this.providerPaymentId,
            amount: this.amount,
            currency: this.currency,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            metadata: this.metadata,
        };
    }
}
