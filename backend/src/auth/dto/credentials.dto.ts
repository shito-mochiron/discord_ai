import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CredentialsDto {
    @IsString()
    google_id

    @IsEmail()
    email: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
    })
    password: string;
}