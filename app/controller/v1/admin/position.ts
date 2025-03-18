import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { PositionService } from "~/app/service/position";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreatePositionPayload, EditPositionPayload } from "~/app/dto/position";

export class PositionController {
  private positionService = new PositionService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreatePositionPayload, req.body);
    const position = await this.positionService.create(payload);
    return res.send(ok(position));
  }

  async getAll(req: Request, res: Response) {
    const positions = await this.positionService.getAll();
    return res.send(ok(positions));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const position = await this.positionService.get(id);
    return res.send(ok(position));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditPositionPayload, req.body);
    const position = await this.positionService.update(payload);
    return res.send(ok(position));
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    await this.positionService.delete(id);
    return res.send(ok());
  }
}