import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { ChangePasswordPayload, LoginPayload } from "~/app/dto/auth";
import { AuthService } from "~/app/service/auth";
import { notFound, ok, unauthorized } from "~/common/response";

export class AuthController {
  private svc: AuthService;
  constructor() {
    this.svc = new AuthService();
  }

}
