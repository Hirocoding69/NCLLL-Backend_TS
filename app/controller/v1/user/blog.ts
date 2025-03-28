import { plainToInstance } from 'class-transformer';
import { Request, Response } from 'express';
import { GetContentQueryParams } from '~/app/dto/blog';
import { ContentService } from '~/app/service/blog';
import { ok, unprocessableEntity } from '~/common/response';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  async getAll(req: Request, res: Response) {
    req.query.status = "published";
    const params = plainToInstance(GetContentQueryParams, req.query);
    const contents = await this.contentService.getAllContent(params);
    return res.json(ok(contents));
  }

  /**
   * Get content by ID
   */
  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const content = await this.contentService.getContentById(id);
    return res.json(ok(content));
  }
}