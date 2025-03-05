import { plainToInstance } from "class-transformer";
import { error } from "console";
import { Request, Response } from "express";
import {  LoginPayload } from "~/app/dto/auth";
import { AuthService } from "~/app/service/auth";
import { notFound, ok, unauthorized } from "~/common/response";

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    const payload = plainToInstance(LoginPayload, req.body);
    try {
      const token = await this.authService.login(payload);
      return res.send(ok({ token }));
    } catch (e:any) {
      return res.status(e.status || 500).send(error);
    }
  }
  async seedAdminAccount(req: Request, res: Response) {
    try {
      await this.authService.seedAdminAccount();
      return res.send(ok());
    } catch (e:any) {
      return res.status(e.status || 500).send(error);
    }
  }
}
