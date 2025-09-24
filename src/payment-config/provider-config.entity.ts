import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { App } from "../apps/app.entity";

@Entity("provider_configs")
export class ProviderConfig {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => App, { onDelete: "CASCADE" })
    app!: App;

    @Column()
    provider!: string;

    @Column("jsonb")
    credentials!: Record<string, any>;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    safe() {
        return {
            id: this.id,
            provider: this.provider,
            active: this.active,
            createdAt: this.createdAt,
        };
    }
}
