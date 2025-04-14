import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MailSignupRequestDto } from './dto/mail-signup-request.dto';
import { MailLoginRequestDto } from './dto/mail-login-request.dto';
import { GoogleSignupRequestDto } from './dto/google-signup-request.dto';
import { GoogleLoginRequestDto } from './dto/google-login-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/mail')
  async signUp(@Body() mailSignupRequestDto: MailSignupRequestDto): Promise<{ token: string }> {
    return await this.authService.createUser(mailSignupRequestDto);
  }

  @Post('signup/google')
  async signUpGoogle(@Body() googleSignupRequestDto: GoogleSignupRequestDto): Promise<{ token: string }> {
    return await this.authService.createUserGoogle(googleSignupRequestDto);
  }

  @Post('login/mail')
  async logIn(@Body() mailLoginRequestDto: MailLoginRequestDto): Promise<{ token: string }> {
    return await this.authService.logIn(mailLoginRequestDto);
  }

  @Post('login/google')
  async logInGoogle(@Body() googleLoginRequestDto: GoogleLoginRequestDto): Promise<{ token: string }> {
    return await this.authService.logInGoogle(googleLoginRequestDto);
  }
}
