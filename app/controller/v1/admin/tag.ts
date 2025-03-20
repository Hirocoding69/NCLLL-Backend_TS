import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { TagService } from "~/app/service/tag";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreateTagPayload, EditTagPayload } from "~/app/dto/tag";

export class TagController {
  private tagService = new TagService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreateTagPayload, req.body);
    const tag = await this.tagService.createTag(payload);
    return res.send(ok(tag));
  }

  async getAll(req: Request, res: Response) {
    const tags = await this.tagService.getAllTags();
    return res.send(ok(tags));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const tag = await this.tagService.getTagById(id);
    return res.send(ok(tag));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditTagPayload, req.body);
    const tag = await this.tagService.updateTag(payload);
    return res.send(ok(tag));
  }

  async softDelete(req: Request, res: Response) {
    const id = req.params.id;
    await this.tagService.deleteTag(id);
    return res.send(ok());
  }
}