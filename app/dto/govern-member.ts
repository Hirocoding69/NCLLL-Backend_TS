import { IsArray, IsEmail, IsInt, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class AddressDto {
  @IsString()
  @IsNotEmpty()
  houseNumber: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CareerDetailDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  detail: string;
}

export class MemberInfoDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  birthDate: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nationality: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  placeOfBirth: AddressDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CareerDetailDto)
  careerStatus?: CareerDetailDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CareerDetailDto)
  experience?: CareerDetailDto[];
}

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateMemberPayload {
  @IsObject()
  @ValidateNested()
  @Type(() => MemberInfoDto)
  en: MemberInfoDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MemberInfoDto)
  kh: MemberInfoDto;

  @IsMongoId()
  @IsNotEmpty()
  position: string;
}

export class EditMemberPayload extends CreateMemberPayload {
  @IsMongoId()
  id: string;
}