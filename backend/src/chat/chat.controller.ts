import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageRequestDto } from './dto/message-request.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async createMessage(@Body() messageRequestDto: MessageRequestDto) {
    return this.chatService.createMessage(messageRequestDto);
  }

  @Get(':chat_id')
  async getChat(@Param('chat_id') chat_id: string) {
    return this.chatService.getChat(chat_id);
  }
}
