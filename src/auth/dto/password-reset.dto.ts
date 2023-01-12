import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
