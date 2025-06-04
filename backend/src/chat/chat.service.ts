import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async createMessage(user_id: string, content: string, chat_id?: string) {
    try {
      let actualChatId = chat_id;
      let generatedTitle: string | undefined;

      // 1. chat_idがない場合は新規チャット作成
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

      // 2. 既存のメッセージ履歴を取得（古い順）
      const previousMessages = await this.prisma.message.findMany({
        where: { chat_id: actualChatId },
        orderBy: { created_at: 'asc' },
      });

      // 3. ChatCompletionMessageParam 型に変換
      const messageHistory: ChatCompletionMessageParam[] = previousMessages.flatMap(msg => [
        { role: 'user', content: msg.content },
        { role: 'assistant', content: msg.content_reply },
      ]);

      // 4. 会話の履歴に新しい入力を追加
      const fullMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...messageHistory,
        { role: 'user', content },
      ];

      // 5. OpenAI に問い合わせ
      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: fullMessages,
      });

      const content_reply = gptResponse.choices[0]?.message?.content;
      if (!content_reply) {
        throw new InternalServerErrorException('Failed to get a response from OpenAI.');
      }

      // 6. メッセージ保存
      const message = await this.prisma.message.create({
        data: {
          chat_id: actualChatId,
          content,
          content_reply,
        },
      });

      return {
        message_id: message.message_id,
        chat_id: actualChatId,
        content: message.content,
        content_reply: message.content_reply,
        title: generatedTitle,
      };
    } catch (error) {
      console.error('createMessage error:', error);
      throw new InternalServerErrorException('An error occurred while creating the message.');
    }
  }


  async getChat(chat_id: string) {
    const messages = await this.prisma.message.findMany({
      where: { chat_id },
      orderBy: { created_at: 'asc' },
    });

    return messages;
  }

  async getPinnedChats(): Promise<{ chat_id: string; title: string }[]> {
    const chats = await this.prisma.chat.findMany({
      where: { is_pinned: true },
      select: {
        chat_id: true,
        title: true,
      },
    });

    return chats;
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