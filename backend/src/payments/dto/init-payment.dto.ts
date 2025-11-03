import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsObject } from "class-validator";

export class InitPaymentDto {
    @IsString()
    @IsNotEmpty()
    provider!: string;

    @IsNumber()
    @IsPositive()
    amount!: number;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}