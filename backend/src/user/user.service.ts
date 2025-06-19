import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(user_id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
      select: {
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUser(user_id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

  const chats = await this.prisma.chat.findMany({
    where: { id: user_id },
    select: { chat_id: true },
  });

  const chatIds = chats.map(c => c.chat_id);

  await this.prisma.message.deleteMany({
    where: { chat_id: { in: chatIds } },
  });

  await this.prisma.chat.deleteMany({
    where: { id: user_id },
  });

  await this.prisma.user.delete({
    where: { id: user_id },
  });

    return { message: 'User deleted successfully' };
  }

}
