import { Request, Response } from "express";
import { TagService } from "~/app/service/tag";
import { ok } from "~/common/response";

export class TagController {
  private tagService = new TagService();

  async getAll(req: Request, res: Response) {
    const tags = await this.tagService.getAllTags();
    return res.send(ok(tags));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const tag = await this.tagService.getTagById(id);
    return res.send(ok(tag));
  }
}