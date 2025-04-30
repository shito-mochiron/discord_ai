import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Put(':chat_id/pin')
  async setPinned(@Param('chat_id') chat_id: string) {
    return this.chatService.setPinned(chat_id);
  }

  @Put(':chat_id/unpin')
  async unsetPinned(@Param('chat_id') chat_id: string) {
    return this.chatService.unsetPinned(chat_id);
  }

}
