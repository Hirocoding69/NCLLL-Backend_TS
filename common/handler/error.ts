import { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash";
import logger from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }

  // body parser fail
  if (err.type === "entity.parse.failed") {
    return res.status(400).send({
      code: 400,
      message: "invalid request body",
      data: null,
    });
  }

  const code = +err.code;
  if (code && !isNaN(code) && code >= 300 && code < 500) {
    res.status(err.code);
  } else {
    logger.error(err);
    return res.status(500).send({
      code: 500,
      message: req.t
        ? req.t("exception.internal_server_error")
        : "exception.internal_server_error",
    });
  }

  let message = req.t ? req.t(err.message) : "exception.internal_server_error";

  if (err.data?.locKey) {
    message = req.t
      ? err.data.locData
        ? req.t(err.data.locKey, err.data.locData)
        : req.t(err.data.locKey)
      : err.locKey;

    delete err.data.locKey;
    delete err.data.locData;
  }

  res.send({
    code,
    message: message,
    data: isEmpty(err.data) ? null : err.data,
  });
}
