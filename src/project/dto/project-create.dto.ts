import {
  IsAlphanumeric,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProjectStatus } from '@prisma/client';
export class CreateProjectDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  @IsOptional()
  urlid?: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsAlphanumeric()
  @IsOptional()
  organizationId?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsString()
  @IsOptional()
  slug?: string;
}
