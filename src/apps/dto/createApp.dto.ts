import { IsString, IsOptional, IsUrl, Length } from "class-validator";

export class CreateAppDto {
    @IsString()
    @Length(3, 50)
    name!: string;

    @IsOptional()
    @IsString()
    @Length(0, 255)
    description?: string;

    @IsOptional()
    @IsUrl({}, { message: "webhookUrl must be a valid URL" })
    webhookUrl?: string;
}
