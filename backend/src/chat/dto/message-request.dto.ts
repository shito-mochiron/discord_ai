import { IsString } from 'class-validator';

export class MessageRequestDto {
  @IsString()
  content: string;
  
  @IsString()
  token: string;

  @IsString()
  chat_id: string;
}