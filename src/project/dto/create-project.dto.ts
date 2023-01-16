import {
  IsAlphanumeric,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

enum ProjectStatus {
  PROPOSED,
  IN_DEVELOPMENT,
  ACTIVE,
  MAINTAINED,
  NOT_MAINTAINED,
  OBSOLETE,
}
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

  // @IsEnum(ProjectStatus)
  // @IsOptional()
  // status?: ProjectStatus;
}
