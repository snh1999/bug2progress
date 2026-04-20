import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTicketCommentDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}
