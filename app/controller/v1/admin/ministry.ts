import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { MinistryService } from "~/app/service/ministry";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreateMinistryPayload, EditMinistryPayload } from "~/app/dto/ministry";

export class MinistryController {
  private ministryService = new MinistryService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreateMinistryPayload, req.body);
    const ministry = await this.ministryService.createMinistry(payload);
    return res.send(ok(ministry));
  }

  async getAll(req: Request, res: Response) {
    const ministries = await this.ministryService.getAllMinistries();
    return res.send(ok(ministries));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const ministry = await this.ministryService.getMinistryById(id);
    return res.send(ok(ministry));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditMinistryPayload, req.body);
    const ministry = await this.ministryService.updateMinistry(payload);
    return res.send(ok(ministry));
  }

  async softDelete(req: Request, res: Response) {
    const id = req.params.id;
    await this.ministryService.deleteMinistry(id);
    return res.send(ok());
  }
}