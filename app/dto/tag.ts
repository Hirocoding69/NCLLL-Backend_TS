import { IsMongoId, IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class TagInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsNotEmpty()
  lang: string;
}

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateTagPayload {
  @IsObject()
  @ValidateNested()
  @Type(() => TagInfoDto)
  en: TagInfoDto;
  
  @IsObject()
  @ValidateNested()
  @Type(() => TagInfoDto)
  kh: TagInfoDto;
}

export class EditTagPayload extends CreateTagPayload {
  @IsMongoId()
  id: string;
}