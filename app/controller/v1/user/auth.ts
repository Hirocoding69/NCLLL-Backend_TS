import {
  LoginPayload,
  RegisterPayload,
} from "~/app/dto/auth";
import { AuthService } from "~/app/service/auth";
import { plainToClass, plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { ok, unauthorized } from "~/common/response";
import _ from "lodash";

export class AuthController {
  private svc: AuthService;
  constructor() {
    this.svc = new AuthService();
  }

}
