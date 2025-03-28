import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class CreateRequestPartnerDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  reason: string;

  @IsString()
  description: string;
}