import { NextFunction, Request, Response } from "express";
import { forbidden } from "../response";

interface Permission {
  name: string;
}

export function hasPermissions(...permissions: string[]) {
  return async function (req: Request, _: Response, next: NextFunction) {
    if (!permissions?.length) {
      return next();
    }

    const user = req.user;
    if (!user?.role?.permissions) {
      throw forbidden();
    }

    const rolePermissions: Permission[] = user.role.permissions;

    const hasPermissions = permissions.every((permission) =>
      rolePermissions.some((rp) => rp.name === permission)
    );

    if (!hasPermissions) {
      throw forbidden();
    }

    next();
  };
}


export function hasRole(...roles: string[]) {
  return async function (req: Request, _: Response, next: NextFunction) {
    if (!roles?.length) {
      return next();
    }

    const user = req.user;
    if (!user?.role) {
      throw forbidden();
    }
    if (!roles.includes(user.role.code)) throw forbidden();
    next();
  };
}

export function hasRoleOrUserType(roles: string[], userTypes: string[]) {
  return async function (req: Request, _: Response, next: NextFunction) {
    if (!roles?.length && !userTypes?.length) {
      return next();
    }

    const user = req.user;

    // Check if user has any of the required roles
    if (roles.length && user?.role) {
      if (roles.includes(user.role.code)) {
        return next();
      }
    }

    // Check if user has any of the required user types
    if (userTypes.length && user?.user_type) {
      if (userTypes.includes(user.user_type.name)) {
        return next();
      }
    }

    // If neither condition is met, throw forbidden
    throw forbidden();
  };
}

export function hasUserType(...userTypes: string[]) {
  return async function (req: Request, _: Response, next: NextFunction) {
    if (!userTypes?.length) return next();
    const user = req.user;
    if (user?.user_type) {
      if (!userTypes.includes(user.user_type.name)) throw forbidden();
    }
    next();
  };
}

export async function adminOnly(req: Request, _: Response, next: NextFunction) {
  const auth = req.user;
  if ((auth?.is_super || !!auth?.role_id) && auth.user_type_id === null) {
    next();
  } else {
    throw forbidden();
  }
}

export async function superAdminOnly(
  req: Request,
  _: Response,
  next: NextFunction
) {
  const auth = req.user;
  if (auth?.is_super) {
    next();
  } else {
    throw forbidden();
  }
}
