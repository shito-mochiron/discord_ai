import { IsNotEmpty, IsString } from "class-validator";

export class CredentialsGoogleDto {
    @IsString()
    @IsNotEmpty()
    idToken: string;
}