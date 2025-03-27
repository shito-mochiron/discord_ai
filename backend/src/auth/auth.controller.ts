import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { CreateUserGoogleDto } from './dto/create-user_google.dto';
import { CredentialsGoogleDto } from './dto/credentials_google.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/mail')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<{ token: string }> {
    return await this.authService.createUser(createUserDto);
  }

  @Post('signup/google')
  async signUpGoogle(@Body() createUserGoogleDto: CreateUserGoogleDto): Promise<{ token: string }> {
    return await this.authService.createUserGoogle(createUserGoogleDto);
  }

  @Post('login/mail')
  async logIn(@Body() credentialsDto: CredentialsDto): Promise<{ token: string }> {
    return await this.authService.logIn(credentialsDto);
  }

  @Post('login/google')
  async logInGoogle(@Body() credentialsGoogleDto: CredentialsGoogleDto): Promise<{ token: string }> {
    return await this.authService.logInGoogle(credentialsGoogleDto);
  }
}
