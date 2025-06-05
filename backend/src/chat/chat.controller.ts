import { Body, Controller, Get, Param, Post, Put, UseGuards, Request, Delete, Query, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageRequestDto } from './dto/message-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // 👈 
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async createMessage(@Body() dto: MessageRequestDto, @Request() req) {
    const { content, chat_id } = dto;
    const user_id = req.user.user_id; 
    return this.chatService.createMessage(user_id, content, chat_id);
  }

  @Get('pin')
  async getPinnedChats(@Request() req) {
    const user_id = req.user.user_id;
    const pinnedChats = await this.chatService.getPinnedChats(user_id);
    return { pinned_chats: pinnedChats };
  }

  @Get('history')
  async getChatHistory(@Request() req) {
    const user_id = req.user.user_id;
    return this.chatService.getChatHistory(user_id);
  }

  @Get('history/search')
  async searchChatHistory(@Query('query') query: string, @Request() req) {
    const user_id = req.user.user_id;

    if (!query || query.trim() === '') {
      throw new BadRequestException('検索ワードは必須です');
    }

    return this.chatService.searchChatHistory(user_id, query);
  }

  @Put(':chat_id/pin')
  async setPinned(@Param('chat_id') chat_id: string, @Request() req) {
    const user_id = req.user.user_id;
    return this.chatService.setPinned(chat_id, user_id);
  }

  @Put(':chat_id/unpin')
  async unsetPinned(@Param('chat_id') chat_id: string, @Request() req) {
    const user_id = req.user.user_id;
    return this.chatService.unsetPinned(chat_id, user_id);
  }

  @Get(':chat_id')
  async getChat(@Param('chat_id') chat_id: string, @Request() req) {
    const user_id = req.user.user_id;
    return this.chatService.getChat(chat_id, user_id);
  }

  @Delete(':chat_id')
  async deleteChat(@Param('chat_id') chat_id: string, @Request() req) {
    const user_id = req.user.user_id;
    return this.chatService.deleteChat(chat_id, user_id);
  }
}
