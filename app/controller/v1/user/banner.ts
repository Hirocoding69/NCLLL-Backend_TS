import { Request, Response } from "express";
import { BannerService } from "~/app/service/banner";
import { ok } from "~/common/response";

export class BannerController {
  private bannerService = new BannerService();

  async getAll(req: Request, res: Response) {
    const banners = await this.bannerService.getAllBanners();
    return res.send(ok(banners));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const banner = await this.bannerService.getBannerById(id);
    return res.send(ok(banner));
  }
}