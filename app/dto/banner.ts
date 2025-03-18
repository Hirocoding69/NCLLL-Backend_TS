import { IsMongoId, IsNotEmpty, IsString, IsUrl } from "class-validator";

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateBannerPayload {
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;
}

export class EditBannerPayload extends CreateBannerPayload {
  @IsMongoId()
  id: string;
}