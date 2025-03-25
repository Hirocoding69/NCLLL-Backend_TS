import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ResourceService } from "~/app/service/resource";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreateResourcePayload, EditResourcePayload, ResourceQueryDto } from "~/app/dto/resource";

export class ResourceController {
  private resourceService = new ResourceService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreateResourcePayload, req.body);
    const resource = await this.resourceService.createResource(payload);
    return res.send(ok(resource));
  }

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

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditResourcePayload, req.body);
    const resource = await this.resourceService.updateResource(payload);
    return res.send(ok(resource));
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    await this.resourceService.deleteResource(id);
    return res.send(ok());
  }
}