import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordChangeDto {
  @ApiProperty({
    description: 'REQUIRED- old password',
    example: 'pass1234',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'REQUIRED- password to be updated',
    example: 'pass1234',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
