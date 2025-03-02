import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { badRequest } from "response";
import { getValidationError } from "../helper/validator";

export function vbody<T>(type: new () => T) {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      const sanitized = plainToInstance(type, req.body) as object;
      const errors = await validate(sanitized);

      if (!errors?.length) return next();

      next(badRequest({ vld_errors: getValidationError(type, errors, req) }));
    } catch (error) {
      next(error); // Ensure errors are passed to Express error handler
    }
  };
}

export function vquery<T>(type: new () => T) {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      const sanitized = plainToInstance(type, req.query) as object;
      const errors = await validate(sanitized, {
        validationError: { target: false },
      });

      if (!errors?.length) return next();

      next(badRequest({ vld_errors: getValidationError(type, errors, req) }));
    } catch (error) {
      next(error);
    }
  };
}
