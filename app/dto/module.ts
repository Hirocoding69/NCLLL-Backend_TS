import { IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ContentInfoDto } from "./blog";


/* ------------------------------------------------------ */
/*                     Query DTO                          */
/* ------------------------------------------------------ */
export class ModuleQueryDto {
    @IsOptional()
    @IsString()
    mainCategory?: string;

    @IsOptional()
    @IsString()
    subCategory?: string;

    @IsOptional()
    @IsString()
    lang?: string;

    @IsOptional()
    @IsString()
    search?: string;

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
export class CreateModulePayload {
    @IsObject()
    @ValidateNested()
    @Type(() => ContentInfoDto)
    @IsOptional()
    en?: ContentInfoDto;

    @IsObject()
    @ValidateNested()
    @Type(() => ContentInfoDto)
    @IsOptional()
    kh?: ContentInfoDto;

    @IsString()
    @IsNotEmpty()
    mainCategory: string;

    @IsString()
    subCategory: string;

    @IsString()
    @IsNotEmpty()
    @IsUrl()
    cover: string;
}

export class EditModulePayload extends CreateModulePayload {
    @IsMongoId()
    id: string;
}