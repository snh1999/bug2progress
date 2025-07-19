import { ProjectRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ContributorDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role!: ProjectRole;
}
