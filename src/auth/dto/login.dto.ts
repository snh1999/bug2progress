import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'REQUIRED- user registed email',
    example: 'abc@domain.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'REQUIRED- password',
    example: 'pass1234',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
