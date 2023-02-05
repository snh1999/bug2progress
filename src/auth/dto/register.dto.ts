import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';
export class RegisterDto {
  @ApiProperty({
    description: 'REQUIRED- account email user registered with',
    example: 'abc@domain.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'REQUIRED- password for login',
    example: 'pass1234',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'REQUIRED+UNIQUE- user full name',
    example: 'John Doe',
  })
  @IsAlpha()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'REQUIRED+UNIQUE- username, for interacting with users',
    example: 'hooman123',
  })
  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'NOT REQUIRED- country name',
    example: 'Bangladesh',
  })
  country?: string;

  @ApiProperty({
    description: 'NOT YET Implemented',
  })
  @IsString()
  photo: string;
}
