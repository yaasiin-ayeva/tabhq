import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Organization } from "../auth/organization.entity";
import { AppApiKey } from "./appApiKey.entity";
import { AppEnvironment } from "../common/enums";

@Entity("apps")
export class App {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        nullable: false,
        unique: false
    })
    name!: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    webhookUrl?: string;

    @Column({
        type: "enum",
        enum: AppEnvironment,
        default: AppEnvironment.DEVELOPMENT,
    })
    environment!: AppEnvironment;

    @ManyToOne(() => Organization, (org) => org.apps, { onDelete: "CASCADE" })
    organization!: Organization;

    @OneToOne(() => AppApiKey, (apiKey) => apiKey.app, { cascade: true, eager: true })
    @JoinColumn()
    apiKey!: AppApiKey;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    safe() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            webhookUrl: this.webhookUrl,
            environment: this.environment,
            organization: this.organization,
            apiKey: this.apiKey?.safe(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
