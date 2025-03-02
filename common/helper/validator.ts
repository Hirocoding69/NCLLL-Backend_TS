import { plainToInstance } from "class-transformer";
import {
  getMetadataStorage,
  validate as v,
  ValidationError,
} from "class-validator";
import { Request } from "express";
import { badRequest } from "response";
import { camelToSnake } from "../utils";

function getTranslationKey(path: string): string {
  let normalized = path.replace(/\[(\d+)\]/g, ".$1");

  return normalized
    .split(".")
    .map((part) => (isNaN(Number(part)) ? part : "*"))
    .join(".");
}

function processNestedErrors(
  error: ValidationError,
  req: Request,
  metadata: any[],
  path: string = ""
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const currentPath = path ? `${path}.${error.property}` : error.property;

  if (error.constraints) {
    const messages = Object.keys(error.constraints).map((key) => {
      const meta = metadata.find((m) => m.name === key);
      const translationKey = getTranslationKey(currentPath);

      return req.t(`validation.${camelToSnake(key)}`, {
        attribute: req.t(`property.${translationKey}`, {
          defaultValue: translationKey,
        }),
        constraints: meta?.constraints,
      });
    });

    if (messages.length) {
      result[currentPath] = messages;
    }
  }

  if (error.children?.length) {
    error.children.forEach((childError) => {
      const childErrors = processNestedErrors(
        childError,
        req,
        metadata,
        currentPath
      );
      Object.assign(result, childErrors);
    });
  }

  return result;
}

export function getValidationError<T>(
  type: new () => T,
  errors: ValidationError[],
  req: Request
): Record<string, string[]> {
  const storage = getMetadataStorage();
  const metadata = storage.getTargetValidationMetadatas(type, "", true, true);

  return errors.reduce((acc: Record<string, string[]>, error) => {
    const nestedErrors = processNestedErrors(error, req, metadata);
    return { ...acc, ...nestedErrors };
  }, {});
}

export async function validate<T extends object>(
  req: Request,
  type: new () => T,
  data: any
): Promise<T> {
  const sanitized = plainToInstance(type, data) as T;
  const errors = await v(sanitized, {
    validationError: { target: false },
  });

  if (!errors.length) return sanitized;

  throw badRequest({
    vld_errors: getValidationError(type, errors, req),
  });
}
