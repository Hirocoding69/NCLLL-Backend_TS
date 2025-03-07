
import { IsString, MinLength } from "class-validator";

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */

export class CreatePositionPayload {
  @IsString()
  title: string;

  @IsString()
  level: string;
}