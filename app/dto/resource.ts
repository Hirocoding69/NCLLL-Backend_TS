import { IsDateString, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import { BasePaginationQuery } from "./base";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateResourcePayload {
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsString()
  @IsNotEmpty()
  lang: string;
  
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  cover: string;
  
  @IsString()
  @IsNotEmpty()
  file: string;
  
  @IsString()
  @IsNotEmpty()
  type: string;
  
  @IsDateString()
  @IsNotEmpty()
  publishedAt: string;
  
  @IsMongoId()
  @IsNotEmpty()
  source: string;
}

export class EditResourcePayload extends CreateResourcePayload {
  @IsMongoId()
  id: string;
}

export class ResourceQueryDto extends BasePaginationQuery {

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  lang?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @IsString()
  @IsOptional()
  source?: string;
}