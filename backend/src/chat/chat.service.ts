import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private async validateChatOwner(chat_id: string, user_id: string) {
    const chat = await this.prisma.chat.findUnique({ where: { chat_id } });
    if (!chat || chat.id !== user_id) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }
    return chat;
  }

  async createMessage(user_id: string, content: string, chat_id?: string) {
    try {
      let actual_chat_id = chat_id;
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
        actual_chat_id = chat.chat_id;
      } else {
        await this.validateChatOwner(chat_id, user_id);
      }

      const previousMessages = await this.prisma.message.findMany({
        where: { chat_id: actual_chat_id },
        orderBy: { created_at: 'asc' },
      });

      const messageHistory: ChatCompletionMessageParam[] = previousMessages.flatMap(msg => [
        { role: 'user', content: msg.content },
        { role: 'assistant', content: msg.content_reply },
      ]);

      const fullMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...messageHistory,
        { role: 'user', content },
      ];

      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: fullMessages,
      });

      const content_reply = gptResponse.choices[0]?.message?.content;
      if (!content_reply) {
        throw new InternalServerErrorException('Failed to get a response from OpenAI.');
      }

      const message = await this.prisma.message.create({
        data: {
          chat_id: actual_chat_id,
          content,
          content_reply,
        },
      });

      return {
        message_id: message.message_id,
        chat_id: actual_chat_id,
        content: message.content,
        content_reply: message.content_reply,
        title: generatedTitle,
      };
    } catch (error) {
      console.error('createMessage error:', error);
      throw new InternalServerErrorException('An error occurred while creating the message.');
    }
  }

  async getChat(chat_id: string, user_id: string, page = 1, pageSize = 20) {
    await this.validateChatOwner(chat_id, user_id);

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { chat_id },
        orderBy: { created_at: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({
        where: { chat_id },
      }),
    ]);

    return {
      data: messages,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getPinnedChats(
    user_id: string,
    page = 1,
    pageSize = 20
  ): Promise<{
    data: { chat_id: string; title: string }[];
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
  }> {
    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: {
          is_pinned: true,
          id: user_id,
        },
        select: {
          chat_id: true,
          title: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.chat.count({
        where: {
          is_pinned: true,
          id: user_id,
        },
      }),
    ]);

    return {
      data: chats,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async setPinned(chat_id: string, user_id: string) {
    await this.validateChatOwner(chat_id, user_id);

    return await this.prisma.chat.update({
      where: { chat_id },
      data: { is_pinned: true },
    });
  }

  async unsetPinned(chat_id: string, user_id: string) {
    await this.validateChatOwner(chat_id, user_id);

    return await this.prisma.chat.update({
      where: { chat_id },
      data: { is_pinned: false },
    });
  }

  async getChatHistory(
    user_id: string,
    page = 1,
    pageSize = 20
  ): Promise<{
    history: { chat_id: string; title: string; timestamp: Date }[];
    pagination: { total: number; page: number; pageSize: number; totalPages: number };
  }> {
    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: { id: user_id },
        orderBy: {
          created_at: 'desc',
        },
        select: {
          chat_id: true,
          title: true,
          created_at: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.chat.count({
        where: { id: user_id },
      }),
    ]);

    return {
      history: chats.map(chat => ({
        chat_id: chat.chat_id,
        title: chat.title,
        timestamp: chat.created_at,
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async searchChatHistory(user_id: string, query: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            content: {
              contains: query,
              mode: 'insensitive', 
            },
          },
          {
            chat: {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
        ],
        chat: {
          id: user_id, 
        },
      },
      select: {
        message_id: true,
        chat_id: true,
        content: true,
        chat: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return {
      results: messages.map(msg => ({
        message_id: msg.message_id,
        chat_id: msg.chat_id,
        title: msg.chat.title,
        message: msg.content,
      })),
    };
  }

  async deleteChat(chat_id: string, user_id: string) {
    await this.validateChatOwner(chat_id, user_id);

    await this.prisma.chat.delete({
      where: { chat_id },
    });

    return { chat_id };
  }

  async getBookmarkedMessages(
    user_id: string,
    page = 1,
    pageSize = 20
  ): Promise<{
    data: {
      message_id: string;
      content: string;
      content_reply: string | null;
      chat_id: string;
    }[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          is_bookmarked: true,
          chat: {
            id: user_id,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        select: {
          message_id: true,
          content: true,
          content_reply: true,
          chat_id: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.message.count({
        where: {
          is_bookmarked: true,
          chat: {
            id: user_id,
          },
        },
      }),
    ]);

    return {
      data: messages,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async bookmarkMessage(message_id: string, user_id: string) {
    const message = await this.prisma.message.findUnique({
      where: { message_id: message_id },
      include: { chat: true },
    });

    if (!message || message.chat.id !== user_id) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    return await this.prisma.message.update({
      where: { message_id: message_id },
      data: { is_bookmarked: true },
    });
  }

  async unbookmarkMessage(message_id: string, user_id: string) {
    const message = await this.prisma.message.findUnique({
      where: { message_id: message_id },
      include: { chat: true },
    });

    if (!message || message.chat.id !== user_id) {
      throw new ForbiddenException('You do not have permission to access this resource.');
    }

    return await this.prisma.message.update({
      where: { message_id: message_id },
      data: { is_bookmarked: false },
    });
  }

}
