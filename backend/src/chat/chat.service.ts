import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageRequestDto } from './dto/message-request.dto';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(messageRequestDto: MessageRequestDto) {
        const { content, chat_id, token } = messageRequestDto;

    // JWT からユーザーIDを取得
    let id: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
      
      id = decoded?.sub as string;

      if (!id) {
        throw new UnauthorizedException('User ID is missing from the token.');
      }
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    let actualChatId = chat_id;
    let generatedTitle: string | undefined;

    // chat_id が空なら新しい Chat を作成
    if (!chat_id) {
      // 仮ロジック
      generatedTitle = content.length > 10 ? content.slice(0, 10) + '...' : content;

      let chat;
      try {
        chat = await this.prisma.chat.create({
          data: {
            chat_id: uuidv4(),
            id,
            title: generatedTitle,
          },
        });
        actualChatId = chat.chat_id;
      } catch (err) {
        throw new Error('Failed to create chat');
      }
    }

    // 仮ロジック
    const content_reply = `返信: ${content}`;

    let message;
    try {
      message = await this.prisma.message.create({
        data: {
          chat_id: actualChatId,
          content,
          content_reply,
        },
      });
    } catch (err) {
      throw new Error('Failed to create message');
    }

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
}