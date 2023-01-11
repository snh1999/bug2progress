import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsAlpha()
  @IsNotEmpty()
  name: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  username: string;

  country: string;

  @IsString()
  photo: string;
}

export class PasswordForgotDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class PasswordResetDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class TokenSignDto {
  id: string;
  username: string;
  name: string;
}
