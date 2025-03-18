import { IsMongoId, IsNotEmpty, IsObject, IsString, IsUrl, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class SponsorInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  description: string;
  
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;
}

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateSponsorPayload {
  @IsObject()
  @ValidateNested()
  @Type(() => SponsorInfoDto)
  en: SponsorInfoDto;
  
  @IsObject()
  @ValidateNested()
  @Type(() => SponsorInfoDto)
  kh: SponsorInfoDto;
}

export class EditSponsorPayload extends CreateSponsorPayload {
  @IsMongoId()
  id: string;
}