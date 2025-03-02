import { IsEmail, IsString, MinLength } from "class-validator";

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */

export class LoginPayload {
  @IsString()
  username: string;

  @IsString()
  password: string;

  ip?: string;
}

export class RegisterPayload {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  confirmPassword: string;

  @IsString()
  secPassword: string;

  @IsString()
  confirmSecPassword: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  ip?: string;

}