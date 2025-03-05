export function internalServerError(payload?: string | object | Array<any>) {
  throw error(500, "exception.internal_server_error", payload);
}

export function unauthorized(payload?: string | object | Array<any>) {
  throw error(401, "exception.unauthorized", payload);
}

export function forbidden(payload?: string | object | Array<any>) {
  throw error(403, "exception.forbidden", payload);
}

export function notFound(payload?: string | object | Array<any>) {
  throw error(404, "exception.not_found", payload);
}

export function badRequest(payload?: string | object | Array<any>) {
  throw error(400, "exception.bad_request", payload);
}

export function unprocessableEntity(payload?: string | object | Array<any>) {
  throw error(422, "exception.unprocessable_entity", payload);
}

export function ok(payload?: number | string | object | Array<any>) {
  let message = "OK";
  let data: any = null;
  if (typeof payload === "string") {
    message = payload;
  } else {
    data = payload;
  }

  return {
    code: 200,
    message,
    data,
  };
}

function error(
  code: number,
  defaultMsg: string,
  payload?: string | object | Array<any>
) {
  let message = defaultMsg;
  let data: any = null;
  if (typeof payload === "string") {
    message = payload;
  } else {
    data = payload;
  }

  return {
    code,
    message,
    data,
  };
}
