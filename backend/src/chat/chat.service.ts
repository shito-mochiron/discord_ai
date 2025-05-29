import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

        // ChatGPT API で返答を生成
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // または 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: 'あなたは親切なアシスタントです。' },
        { role: 'user', content: 'こんにちは' },
      ],
    });

    const content_reply = gptResponse.choices[0]?.message?.content ?? '（返答が得られませんでした）';

    console.log(content_reply);

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