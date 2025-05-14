import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(user_id: string, content: string, chat_id?: string) {
    let actualChatId = chat_id;
    let generatedTitle: string | undefined;

    if (!chat_id) {
      generatedTitle = content.length > 10 ? content.slice(0, 10) + '...' : content;
      const chat = await this.prisma.chat.create({
        data: {
          chat_id: uuidv4(),
          id: user_id,
          title: generatedTitle,
        },
      });
      actualChatId = chat.chat_id;
    }

    const message = await this.prisma.message.create({
      data: {
        chat_id: actualChatId,
        content,
        content_reply: `返信: ${content}`,
      },
    });

    return {
      message_id: message.message_id,
      chat_id: actualChatId,
      content: message.content,
      content_reply: message.content_reply,
      title: generatedTitle,
    };
  }

  async getChat(chat_id: string) {
    const messages = await this.prisma.message.findMany({
      where: { chat_id },
      orderBy: { created_at: 'asc' },
    });

    return messages;
  }

  async setPinned(chat_id: string) {
    const updatedChat = await this.prisma.chat.update({
      where: { chat_id },
      data: { is_pinned: true },
    });
    return updatedChat;
  }

  async unsetPinned(chat_id: string) {
    const updatedChat = await this.prisma.chat.update({
      where: { chat_id },
      data: { is_pinned: false },
    });
    return updatedChat;
  }

}