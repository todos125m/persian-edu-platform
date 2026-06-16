import { IsString, MinLength } from 'class-validator';

export class ReplyTicketDto {
  @IsString()
  @MinLength(1)
  body: string;
}
