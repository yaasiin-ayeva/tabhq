import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    firstname!: string;

    @IsNotEmpty()
    lastname!: string;

    @IsEmail()
    email!: string;

    @MinLength(8)
    password!: string;

    @IsNotEmpty()
    orgName!: string;
}
