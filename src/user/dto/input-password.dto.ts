import { IsNotEmpty, IsString } from 'class-validator';

export class InputPasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
