import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageRequestDto } from './dto/message-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async createMessage(@Body() dto: MessageRequestDto, @Request() req) {
    const { content, chat_id } = dto;
    const user_id = req.user.user_id;   // JwtStrategy で注入
    return this.chatService.createMessage(user_id, content, chat_id);
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