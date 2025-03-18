import { plainToInstance } from "class-transformer";
import { error } from "console";
import { Request, Response } from "express";
import { LoginPayload } from "~/app/dto/auth";
import { AuthService } from "~/app/service/auth";
import { forbidden, notFound, ok, unauthorized, unprocessableEntity } from "~/common/response";

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    const payload = plainToInstance(LoginPayload, req.body);
    const token = await this.authService.login(payload);
    return res.send(ok({ token }));
  }
  async seedAdminAccount(req: Request, res: Response) {
    const token = req.header("Authorization")?.replace("Bearer ", "")?.trim();
    if (token !== process.env.SEED_KEY) throw unprocessableEntity();
    await this.authService.seedAdminAccount();
    return res.send(ok());
  }
}
