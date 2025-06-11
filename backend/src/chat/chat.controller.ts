// chat.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Query, BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageRequestDto } from './dto/message-request.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserId } from '@/common/decorators/user-id.decorator'; // パスは適宜変更

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async createMessage(@Body() dto: MessageRequestDto, @UserId() user_id: string) {
    const { content, chat_id } = dto;
    return this.chatService.createMessage(user_id, content, chat_id);
  }

  @Get('pin')
  async getPinnedChats(@UserId() user_id: string) {
    const pinnedChats = await this.chatService.getPinnedChats(user_id);
    return { pinned_chats: pinnedChats };
  }

  @Get('history')
  async getChatHistory(@UserId() user_id: string) {
    return this.chatService.getChatHistory(user_id);
  }

  @Get('history/search')
  async searchChatHistory(@Query('query') query: string, @UserId() user_id: string) {
    if (!query || query.trim() === '') {
      throw new BadRequestException("The search keyword is required.");
    }
    return this.chatService.searchChatHistory(user_id, query);
  }

  @Get('message/bookmark')
  async getBookmarkedMessages(@UserId() user_id: string) {
    const bookmarks = await this.chatService.getBookmarkedMessages(user_id);
    return { bookmarks };
  }

  @Put('message/:message_id/bookmark')
  async bookmarkMessage(@Param('message_id') message_id: string, @UserId() user_id: string) {
    return this.chatService.bookmarkMessage(message_id, user_id);
  }

  @Put('message/:message_id/unbookmark')
  async unbookmarkMessage(@Param('message_id') message_id: string, @UserId() user_id: string) {
    return this.chatService.unbookmarkMessage(message_id, user_id);
  }

  @Put(':chat_id/pin')
  async setPinned(@Param('chat_id') chat_id: string, @UserId() user_id: string) {
    return this.chatService.setPinned(chat_id, user_id);
  }

  @Put(':chat_id/unpin')
  async unsetPinned(@Param('chat_id') chat_id: string, @UserId() user_id: string) {
    return this.chatService.unsetPinned(chat_id, user_id);
  }

  @Get(':chat_id')
  async getChat(@Param('chat_id') chat_id: string, @UserId() user_id: string) {
    return this.chatService.getChat(chat_id, user_id);
  }

  @Delete(':chat_id')
  async deleteChat(@Param('chat_id') chat_id: string, @UserId() user_id: string) {
    return this.chatService.deleteChat(chat_id, user_id);
  }
}
