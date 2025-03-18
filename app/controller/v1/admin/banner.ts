import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { BannerService } from "~/app/service/banner";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreateBannerPayload, EditBannerPayload } from "~/app/dto/banner";

export class BannerController {
  private bannerService = new BannerService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreateBannerPayload, req.body);
    const banner = await this.bannerService.createBanner(payload);
    return res.send(ok(banner));
  }

  async getAll(req: Request, res: Response) {
    const banners = await this.bannerService.getAllBanners();
    return res.send(ok(banners));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const banner = await this.bannerService.getBannerById(id);
    return res.send(ok(banner));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditBannerPayload, req.body);
    const banner = await this.bannerService.updateBanner(payload);
    return res.send(ok(banner));
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    await this.bannerService.deleteBanner(id);
    return res.send(ok());
  }
}