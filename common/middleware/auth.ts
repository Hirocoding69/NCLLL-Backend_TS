import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { unauthorized } from "response";
import { IsNull, MoreThan } from "typeorm";

export function authMiddleware(type: "app" | "admin") {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (shouldSkip(req.originalUrl)) {
      return next();
    }

    const token = req.header("Authorization")?.replace("Bearer ", "")?.trim();
    if (!token) {
      throw unauthorized();
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(
        token,
        process.env.JWT_SECRET || ""
      ) as jwt.JwtPayload;
    } catch (e: any) {
      throw unauthorized();
    }
    next();
  };
}

function shouldSkip(path: string) {
  const basePaths = ["/auth/login", "/auth/seed"];
  const userPaths = ["/app-versions/latest", "/app-versions/check"];
  const pathsToCheck = [
    "/health-check",
    ...basePaths.flatMap((p) => ["/v1/a" + p, "/v1/u" + p]),
    ...userPaths.flatMap((p) => ["/v1/u" + p]),
  ];

  return pathsToCheck.some((endpoint) => path.startsWith(endpoint));
}
