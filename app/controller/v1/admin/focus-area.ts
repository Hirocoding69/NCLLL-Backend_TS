import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { FocusAreaService } from "~/app/service/focus-area";
import { ok } from "~/common/response";
import { CreateFocusAreaPayload, EditFocusAreaPayload, FocusAreaQueryDto } from "~/app/dto/focus-area";

export class FocusAreaController {
  private focusAreaService = new FocusAreaService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreateFocusAreaPayload, req.body);
    const focusArea = await this.focusAreaService.createFocusArea(payload);
    return res.send(ok(focusArea));
  }

  async getAll(req: Request, res: Response) {
    const queryDto = plainToInstance(FocusAreaQueryDto, req.query);
    const paginatedResult = await this.focusAreaService.getFocusAreas(queryDto);
    return res.send(ok(paginatedResult));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const focusArea = await this.focusAreaService.getFocusAreaById(id);
    return res.send(ok(focusArea));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditFocusAreaPayload, req.body);
    const focusArea = await this.focusAreaService.updateFocusArea(payload);
    return res.send(ok(focusArea));
  }

  async softDelete(req: Request, res: Response) {
    const id = req.params.id;
    await this.focusAreaService.deleteFocusArea(id);
    return res.send(ok());
  }
}