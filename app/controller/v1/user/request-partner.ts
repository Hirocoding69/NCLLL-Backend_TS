import { Request, Response } from "express";
import { RequestPartnerService } from "~/app/service/request-partner";
import { ok } from "~/common/response";

export class RequestPartnerController {
  private services = new RequestPartnerService();

  async create(req: Request, res: Response) {
    const rsp = await this.services.create(req.body);
    return res.send(ok(rsp));
  }
  async getAll(req: Request, res: Response) {
    const rsp = await this.services.getAll();
    return res.send(ok(rsp));
  }

}