import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostCommentDto {
  @IsString()
  @IsNotEmpty()
  text!: string;
}
