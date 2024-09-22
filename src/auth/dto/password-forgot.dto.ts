import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordForgotDto {
  @ApiProperty({
    description: 'REQUIRED- account email user registered with',
    example: 'abc@domain.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
