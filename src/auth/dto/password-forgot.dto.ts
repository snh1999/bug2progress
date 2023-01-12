import { IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordForgotDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
