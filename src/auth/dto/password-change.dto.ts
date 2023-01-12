import { IsString, IsNotEmpty } from 'class-validator';

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
