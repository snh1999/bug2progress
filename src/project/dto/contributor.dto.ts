import { ProjectRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContributorDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(ProjectRole)
  @IsOptional()
  role: ProjectRole;
}

export class UpdateContributorDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}

export class DeleteContributorDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
