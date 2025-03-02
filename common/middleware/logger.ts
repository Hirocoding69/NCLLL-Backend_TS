import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on("finish", () => {
    const path = req.originalUrl;
    const statusCode = res.statusCode;

    if (statusCode >= 400) {
      logger.error(`Error response ${path} with status code ${statusCode}.`);
    } else {
      // Dont pollute cloudwatch logs
      if (process.env.APP_ENV === "local") {
        logger.info(
          `Success responded ${path} with status code ${statusCode}.`
        );
      }
    }
  });

  next();
}
