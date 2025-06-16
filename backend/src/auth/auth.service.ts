import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailSignupRequestDto } from './dto/mail-signup-request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailLoginRequestDto } from './dto/mail-login-request.dto';
import { JwtPayload } from 'src/types/jwtPayload';
import { GoogleSignupRequestDto } from './dto/google-signup-request.dto';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginRequestDto } from './dto/google-login-request.dto';

@Injectable()
export class AuthService {
  private readonly client: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new Error(
        'GOOGLE_CLIENT_ID is not defined in environment variables',
      );
    }
    this.googleClientId = googleClientId;
    this.client = new OAuth2Client(this.googleClientId);
  }

  async createUser(
    mailSignupRequestDto: MailSignupRequestDto,
  ): Promise<{ token: string }> {
    const { email, password } = mailSignupRequestDto;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ForbiddenException('This email is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return this.logIn({ email, password });
  }

  async createUserGoogle(
    googleSignupRequestDto: GoogleSignupRequestDto,
  ): Promise<{ token: string }> {
    const { idToken } = googleSignupRequestDto;
    console.log("e", idToken)
    console.log("===============")

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid ID Token');
      }

      const { sub, email } = payload;

      const existingUser = await this.prismaService.user.findUnique({
        where: { google_auth_sub: sub },
      });

      if (existingUser) {
        throw new ForbiddenException('This Google account is already registered');
      }

      await this.prismaService.user.create({
        data: {
          google_auth_sub: sub,
          email,
        },
      });

      return this.logInGoogle({ idToken });

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new UnauthorizedException(
        `Google authentication failed: ${error.message}`,
      );
    }
  }

  async logIn(
    mailLoginRequestDto: MailLoginRequestDto,
  ): Promise<{ token: string }> {
    const { email, password } = mailLoginRequestDto;
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload: JwtPayload = {
      sub: user.id,
    };
    const token = this.jwtService.sign(payload);
    return { token };
  }

  async logInGoogle(
    googleLoginRequestDto: GoogleLoginRequestDto,
  ): Promise<{ token: string }> {
    const { idToken } = googleLoginRequestDto;

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });

      const googlePayload = ticket.getPayload();
      if (!googlePayload) {
        throw new UnauthorizedException('Invalid ID Token');
      }

      const { sub } = googlePayload;

      let user = await this.prismaService.user.findUnique({
        where: { google_auth_sub: sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const jwtPayload: JwtPayload = {
        sub: user.id,
      };

      const token = this.jwtService.sign(jwtPayload);
      return { token };
    } catch (error) {
      throw new UnauthorizedException(`Google login failed: ${error.message}`);
    }
  }
}
