import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordResetDto {
  @ApiProperty({
    description: 'REQUIRED- new password for login',
    example: 'pass1234',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
