import { IsNotEmpty, IsString, IsAlphanumeric } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsAlphanumeric()
  @IsNotEmpty()
  urlid!: string;
}
