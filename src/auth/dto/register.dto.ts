import { IsEmail, IsOptional, IsString } from 'class-validator';
export class RegisterDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  name!: string;

  @IsString()
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
