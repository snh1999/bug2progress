import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
// TODO- figure out the way to add links
// TODO- Maybe process = a file
export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  process: string;

  @IsBoolean()
  @IsOptional()
  ispublic: boolean;
}
