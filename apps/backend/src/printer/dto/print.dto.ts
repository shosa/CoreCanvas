import { IsString, IsNumber, IsOptional, IsObject, IsArray, Min } from 'class-validator';

export class PrintDto {
  @IsArray()
  elements: any[];

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  @Min(1)
  copies: number = 1;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @IsOptional()
  @IsString()
  templateId?: string;
}

export class PreviewDto {
  @IsArray()
  elements: any[];

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}
