import { plainToClass } from 'class-transformer';
import { Request, Response } from 'express';
import { CreateContentPayload, EditContentPayload, GetContentQueryParams } from '~/app/dto/blog';
import { ContentService } from '~/app/service/blog';
import { ok, unprocessableEntity } from '~/common/response';

export class ContentController {
  private contentService: ContentService;

  constructor() {
    this.contentService = new ContentService();
  }

  /**
   * Create a new content entry
   */
  async create(req: Request, res: Response) {
    const payload = plainToClass(CreateContentPayload, req.body);
    if(!payload.en && !payload.kh) {
        throw unprocessableEntity('Either English or Khmer content is required');
    }
    const content = await this.contentService.createContent(payload);
    return res.json(ok(content));
  }

  /**
   * Get all content entries with optional filtering
   */
  async getAll(req: Request, res: Response) {
    const params = req.query as unknown as GetContentQueryParams;
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

  /**
   * Update content
   */
  async update(req: Request, res: Response) {
    const payload = req.body as EditContentPayload;
    const updatedContent = await this.contentService.updateContent(payload);
    return res.json(ok(updatedContent));
  }

  /**
   * Soft delete content (sets deleted_at field)
   */
  async softDelete(req: Request, res: Response) {
    const id = req.params.id;
    await this.contentService.softDeleteContent(id);
    return res.json(ok({ message: 'Content soft deleted okfully' }));
  }

  /**
   * Hard delete content (removes from database)
   */
  async hardDelete(req: Request, res: Response) {
    const id = req.params.id;
    await this.contentService.hardDeleteContent(id);
    return res.json(ok({ message: 'Content permanently deleted' }));
  }

  /**
   * Search content by title
   */
  async search(req: Request, res: Response) {
    const query = req.query.q as string;
    if (!query || query.trim() === '') {
      return res.json(ok([]));
    }
    
    const results = await this.contentService.searchContent(query);
    return res.json(ok(results));
  }
}