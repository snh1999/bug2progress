import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTicketCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
