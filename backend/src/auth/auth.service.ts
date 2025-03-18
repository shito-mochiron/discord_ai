import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CredentialsDto } from './dto/credentials.dto';
import { JwtPayload } from 'src/types/jwtpayload';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService:PrismaService,
        private readonly jwtService:JwtService,
    ) {}
        async createUser(createUserDto: CreateUserDto): Promise<User> {
            const { name, google_id, email, password } = createUserDto;

            const hashedPassword = await bcrypt.hash(password,10);

            return await this.prismaService.user.create({
                data: {
                    name,
                    google_id,
                    email,
                    password: hashedPassword,
                },
            });
        }
    async logIn(credentialsDto:CredentialsDto): Promise< {token: string}> {
        const { email, password } = credentialsDto;
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
            },
        });

        if (user && await bcrypt.compare(password, user.password)) {
            const payload: JwtPayload = {
                sub: user.id,
                username: user.name,
            };
            const token = this.jwtService.sign(payload);
            return { token };
        }
        throw new UnauthorizedException();
    }
}
