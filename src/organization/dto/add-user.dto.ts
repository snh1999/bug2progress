import { IsNotEmpty, IsString } from 'class-validator';

export class AddUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;
}

export class RemoveUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;
}
export class AddUsersDto {
  @IsString()
  @IsNotEmpty()
  userName: string[];
}
