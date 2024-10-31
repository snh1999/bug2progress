import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MemberType } from '@prisma/client';

export class OrgMembersDto {
  @IsString()
  @IsNotEmpty()
  userName!: string;
}

export class OrgMemberRoleDto {
  @IsEnum(MemberType)
  @IsNotEmpty()
  role!: MemberType;
}

export class ChangeMemberRoleDto {
  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsEnum(MemberType)
  @IsNotEmpty()
  role!: MemberType;
}
