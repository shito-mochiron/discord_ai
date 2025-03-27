import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CredentialsDto } from './dto/credentials.dto';
import { JwtPayload } from 'src/types/jwtpayload';
import { CreateUserGoogleDto } from './dto/create-user_google.dto';
import { OAuth2Client } from 'google-auth-library';
import { CredentialsGoogleDto } from './dto/credentials_google.dto';

@Injectable()
export class AuthService {
    private readonly client: OAuth2Client;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        console.log(googleClientId)
        if (!googleClientId) {
            throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables');
        }
        this.client = new OAuth2Client(googleClientId);
    }

    async createUser(createUserDto: CreateUserDto): Promise<{ token: string }> {
        const { email, password } = createUserDto;

        const existingUser = await this.prismaService.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new ConflictException('This email is already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.prismaService.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        // 作成後にログイン処理を使ってJWTを返す
        return this.logIn({ email, password });
    }

    async createUserGoogle(createUserGoogleDto: CreateUserGoogleDto): Promise<{ token: string }> {
        const { idToken } = createUserGoogleDto;

        try {
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new UnauthorizedException('Invalid ID Token');
            }

            const { sub, email } = payload;

            let user = await this.prismaService.user.findUnique({ where: { sub } });

            if (!user) {
                user = await this.prismaService.user.create({
                    data: { sub, email },
                });
            }

            // 作成後にログイン処理を使ってJWTを返す
            return this.logInGoogle({ idToken });
        } catch (error) {
            throw new UnauthorizedException(`Google authentication failed: ${error.message}`);
        }
    }

    async logIn(credentialsDto: CredentialsDto): Promise<{ token: string }> {
        const { email, password } = credentialsDto;
        const user = await this.prismaService.user.findUnique({
            where: { email },
        });

        if (user && await bcrypt.compare(password, user.password)) {
            const payload: JwtPayload = {
                sub: user.id,
            };
            const token = this.jwtService.sign(payload);
            return { token };
        }
        throw new UnauthorizedException();
    }

    async logInGoogle(credentialsGoogleDto: CredentialsGoogleDto): Promise<{ token: string }> {
        const { idToken } = credentialsGoogleDto;

        try {;
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const googlePayload = ticket.getPayload();
            if (!googlePayload) {
                throw new UnauthorizedException('Invalid ID Token');
            }

            const { sub, email } = googlePayload;

            let user = await this.prismaService.user.findUnique({
                where: { sub },
            });

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
