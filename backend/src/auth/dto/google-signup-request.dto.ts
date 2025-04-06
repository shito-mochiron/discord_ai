import { IsNotEmpty, IsString } from 'class-validator';
export class GoogleSignupRequestDto {
    @IsString()
    @IsNotEmpty()
    idToken: string;
}