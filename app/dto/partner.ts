import { IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class PartnerInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  lang: string;
}

/* ------------------------------------------------------ */
/*                     Query DTO                          */
/* ------------------------------------------------------ */
export class PartnerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  lang?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  sortOrder?: string = 'DESC';

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreatePartnerPayload {
  @IsObject()
  @ValidateNested()
  @Type(() => PartnerInfoDto)
  @IsOptional()
  en?: PartnerInfoDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PartnerInfoDto)
  @IsOptional()
  kh?: PartnerInfoDto;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  logo: string;
}

export class EditPartnerPayload extends CreatePartnerPayload {
  @IsMongoId()
  id: string;
}