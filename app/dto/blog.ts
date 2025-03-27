import { ArrayMinSize, IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested, isMongoId } from "class-validator";
import { Type } from "class-transformer";
import { Admin } from "../entity/admin";
import { Mongoose } from "mongoose";
import { ContentStatus } from "aws-sdk/clients/wisdom";
import { BasePaginationQuery } from "./base";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class TipTapContentDto {
  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;
}

export class ContentInfoDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TipTapContentDto)
  document: TipTapContentDto;
  
  @IsString()
  @IsOptional()
  description?: string;
}

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateContentPayload {
  @IsObject()
  @ValidateNested()
  @IsOptional()
  @Type(() => ContentInfoDto)
  en?: ContentInfoDto;
  
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ContentInfoDto)
  kh?: ContentInfoDto;
  
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  tags: string[];
  
  @IsString()
  @IsOptional()
  category?: string;
  auth: Admin;
}

export class EditContentPayload extends CreateContentPayload {
  @IsMongoId()
  id: string;
  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  @IsNotEmpty()
  status?: ContentStatus;
}

export class GetContentQueryParams extends BasePaginationQuery {
  @IsString()
  @IsOptional()
  category?: string;
  
  @IsMongoId()
  @IsOptional()
  parentId?: string;
  
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  status?: ContentStatus;

  @IsBoolean()
  @IsOptional()
  includeDeleted?: boolean;

  @IsMongoId()
  @IsOptional()
  tag: string;

  @IsString()
  @IsOptional()
  year: string;
  

}