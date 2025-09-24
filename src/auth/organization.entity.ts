import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { OrganizationMember } from "./organizationMember.entity";
import { App } from "../apps/app.entity";

@Entity("organizations")
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: false, nullable: false })
  name!: string;

  @OneToMany(() => OrganizationMember, (member) => member.organization)
  members!: OrganizationMember[];

  @OneToMany(() => App, (app) => app.organization)
  apps!: App[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
