import { IsMongoId, IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class MinistryInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateMinistryPayload {
  @IsObject()
  @ValidateNested()
  @Type(() => MinistryInfoDto)
  en: MinistryInfoDto;
  
  @IsObject()
  @ValidateNested()
  @Type(() => MinistryInfoDto)
  kh: MinistryInfoDto;
}

export class EditMinistryPayload extends CreateMinistryPayload {
  @IsMongoId()
  id: string;
}