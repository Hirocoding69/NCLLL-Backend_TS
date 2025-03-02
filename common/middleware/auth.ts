import { db } from "~/database/mysql";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { unauthorized } from "response";
import { Account } from "~/app/entity/admin";

export function authMiddleware() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      // Skip logic (e.g., for public routes)
      if (shouldSkip(req.originalUrl)) {
        return next();
      }

      // Retrieve the token from the Authorization header
      const token = req.header("Authorization")?.replace("Bearer ", "")?.trim();

      console.log(token);

      if (!token) {
        return next(unauthorized());
      }

      let payload: jwt.JwtPayload;

      try {
        payload = jwt.verify(token, process.env.JWT_SECRET || "") as jwt.JwtPayload;
      } catch (e: any) {
        return next(unauthorized());
      }

      const currentUser = await db.getRepository(Account).findOne({
        where: {
          id: payload.id,
        },
      });

      if (!currentUser) {
        return next(unauthorized());
      }

      req.user = currentUser;
      next();
    } catch (err) {
      next(err); 
    }
  };
}


function shouldSkip(path: string) {
  const basePaths = ["/auth/login", "/auth/refresh-token", "/auth/register", "/accounts/find", "/auth/check-secpassword", "/auth/recover-password"];
  const userPaths = ["/app-versions/latest", "/app-versions/check"];
  const pathsToCheck = [
    "/health-check",
    ...basePaths.flatMap((p) => ["/v1/a" + p, "/v1/u" + p]),
    ...userPaths.flatMap((p) => ["/v1/u" + p]),
  ];

  return pathsToCheck.some((endpoint) => path.startsWith(endpoint));
}
