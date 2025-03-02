import { Request, Response, NextFunction } from "express";
import moment from "moment";

const requestTimes: Record<string, number> = {};

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const userIP = req.ip;

  if (!userIP) {
    return next();
  }

  const lastRequestTime = requestTimes[userIP];

  const currentTime = moment().unix();
  const timeoutDuration = 1; 

  if (lastRequestTime && currentTime - lastRequestTime < timeoutDuration) {
    return res.status(429).json({
      message: "Too many requests. Please try again later.",
    });
  }

  requestTimes[userIP] = currentTime;

  next();
}


