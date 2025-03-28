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

  @IsMongoId()
  @IsOptional()
  source?: string;
  
  @IsString()
  @IsOptional()
  keyword?: string;
}


/**
 * Interface for combined query parameters
 */
export class CombinedQueryDto {
  page?: number;
  limit?: number;
  year?: number;
  search?: string;
  keyword?: string; // Used for resources
  category?: string;
  type?: string;
  tag?: string;
  lang?: string;
  source?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  includeDeleted?: boolean;
}

/**
 * Interface for combined content item
 */
export interface CombinedItem {
  _id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  contentType: 'content' | 'resource'; // Discriminator field
  category?: string;
  type?: string;
  tags?: any[];
  source?: any;
  publishedAt?: Date;
  created_at: Date;
  updated_at?: Date;
  originalItem: any; // Reference to the original item
}
