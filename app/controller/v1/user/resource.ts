import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ResourceService } from "~/app/service/resource";
import { ok } from "~/common/response";
import { ResourceQueryDto } from "~/app/dto/resource";

export class ResourceController {
  private resourceService = new ResourceService();

  async getResources(req: Request, res: Response) {
    const queryDto = plainToInstance(ResourceQueryDto, req.query);

    const paginatedResult = await this.resourceService.getResources(queryDto);

    return res.send(ok(paginatedResult));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const resource = await this.resourceService.getResourceById(id);
    return res.send(ok(resource));
  }
}