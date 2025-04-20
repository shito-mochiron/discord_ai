import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageRequestDto } from './dto/message-request.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async createMessage(@Body() messageRequestDto: MessageRequestDto) {
    return this.chatService.createMessage(messageRequestDto);
  }
}
