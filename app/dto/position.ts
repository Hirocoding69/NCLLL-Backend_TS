import { IsInt, IsMongoId, IsNotEmpty, IsObject, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class PositionInfoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  level: number;
}

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreatePositionPayload {
  @IsObject()
  @ValidateNested()
  @Type(() => PositionInfoDto)
  en: PositionInfoDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PositionInfoDto)
  kh: PositionInfoDto;
}

export class EditPositionPayload extends CreatePositionPayload{
  @IsMongoId()
  id: string;
}