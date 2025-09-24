import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn } from "typeorm";
import { App } from "./app.entity";

@Entity("app_api_keys")
export class AppApiKey {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToOne(() => App, (app) => app.apiKey, { onDelete: "CASCADE" })
    app!: App;

    @Column({ unique: true })
    key!: string;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    safe() {
        return {
            id: this.id,
            key: this.key,
            active: this.active,
            createdAt: this.createdAt,
        };
    }
}
