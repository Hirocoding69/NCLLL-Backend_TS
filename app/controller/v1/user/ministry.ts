import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { MinistryService } from "~/app/service/ministry";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreateMinistryPayload, EditMinistryPayload } from "~/app/dto/ministry";

export class MinistryController {
  private ministryService = new MinistryService();

  async getAll(req: Request, res: Response) {
    const ministries = await this.ministryService.getAllMinistries();
    return res.send(ok(ministries));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const ministry = await this.ministryService.getMinistryById(id);
    return res.send(ok(ministry));
  }
}