import { Admin } from "~/app/entity/admin";
import { TFunction } from "i18next";
import { AccessToken } from "~/app/entity/access-token";

declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
      t: TFunction;
      token: AccessToken;
      file?: Express.Multer.File;
      clientIp: string;
    }
  }
}
