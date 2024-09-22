import { IsString } from 'class-validator';

export class PasswordChangeDto {
  @IsString()
  oldPassword!: string;

  @IsString()
  newPassword!: string;
}
