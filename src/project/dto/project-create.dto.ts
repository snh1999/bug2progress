import {
  IsAlphanumeric,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ProjectStatus } from '@prisma/client';
export class CreateProjectDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  @IsOptional()
  urlid?: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

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
  @MaxLength(100)
  @IsOptional()
  slug?: string;
}
