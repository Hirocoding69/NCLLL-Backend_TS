import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { TagService } from "~/app/service/tag";
import { ok } from "~/common/response";
import { EditWebsiteSettingsPayload } from "~/app/dto/website-settings";
import { WebsiteSettingsService } from "~/app/service/website-settings";

export class WebsiteSettingsController {
  private websiteSettingsService = new WebsiteSettingsService();

  async getOne(req: Request, res: Response) {
    const tag = await this.websiteSettingsService.getOne();
    return res.send(ok(tag));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditWebsiteSettingsPayload, req.body);
    const tag = await this.websiteSettingsService.updateSettings(payload);
    return res.send(ok(tag));
  }
}