import { IsNotEmpty, IsString } from 'class-validator';
export class CreateUserGoogleDto {
    @IsString()
    @IsNotEmpty()
    idToken: string;
}