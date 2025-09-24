import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsObject, ValidateNested } from "class-validator";

class StripeCredentialsDto {
    @IsString()
    @IsNotEmpty()
    secretKey!: string;
}


class MobileMoneyCredentialsDto {
    @IsString()
    @IsNotEmpty()
    apiUser!: string;

    @IsString()
    @IsNotEmpty()
    apiKey!: string;
}

class FlutterwaveCredentialsDto {
    @IsString()
    @IsNotEmpty()
    secretKey!: string;

    @IsString()
    @IsNotEmpty()
    publicKey!: string;
}

export class SetProviderConfigDto {
    @IsString()
    @IsNotEmpty()
    provider!: string;

    @IsObject()
    @ValidateNested()
    @Type((opts) => {
        switch (opts?.object?.provider) {
            case "stripe":
                return StripeCredentialsDto;
            case "flutterwave":
                return FlutterwaveCredentialsDto;
            case "mobilemoney":
                return MobileMoneyCredentialsDto;
            default:
                return Object;
        }
    })
    credentials!: any;
}
