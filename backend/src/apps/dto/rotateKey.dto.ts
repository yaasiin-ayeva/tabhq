import { IsUUID } from "class-validator";

export class RotateApiKeyDto {
    @IsUUID()
    appId!: string;
}