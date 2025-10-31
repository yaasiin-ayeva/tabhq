import { IsNotEmpty, IsString } from "class-validator";

export class ProviderParamsDto {
    @IsString()
    @IsNotEmpty()
    provider!: string;

    @IsString()
    @IsNotEmpty()
    appId!: string;
}
