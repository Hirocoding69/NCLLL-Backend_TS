import { IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

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
  
  @IsString()
  @IsOptional()
  parentId?: string;
  
  @IsString()
  @IsOptional()
  category?: string;
}

export class EditContentPayload extends CreateContentPayload {
  @IsMongoId()
  id: string;
}

export class GetContentQueryParams {
  @IsString()
  @IsOptional()
  category?: string;
  
  @IsMongoId()
  @IsOptional()
  parentId?: string;
}