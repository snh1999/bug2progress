import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';
export class RegisterDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsAlpha()
  name!: string;

  @IsAlphanumeric()
  username!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsOptional()
  @IsString()
  photo?: string;
}
