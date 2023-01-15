import { IsEmail, IsOptional, IsString, IsAlphanumeric } from 'class-validator';

export class EditProfileDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsAlphanumeric()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  birthday?: string;

  @IsString()
  @IsOptional()
  photo?: string;
}
