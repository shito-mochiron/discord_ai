import { IsString } from 'class-validator';

export class MessageRequestDto {
  @IsString()
  content: string;

  @IsString()
  chat_id: string;
}