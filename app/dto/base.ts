import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { Transform, Type } from "class-transformer";

export class BasePaginationQuery {
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}