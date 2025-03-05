import { IsString, MinLength } from "class-validator";

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */

export class LoginPayload {
  @IsString()
  username: string;

  @IsString()
  password: string;

  platform: string;
}

export class ChangePasswordPayload {
  @IsString()
  @MinLength(4)
  old_password: string;

  @IsString()
  @MinLength(4)
  new_password: string;

}
