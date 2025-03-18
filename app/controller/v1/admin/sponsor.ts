import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { SponsorService } from "~/app/service/sponsor";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreateSponsorPayload, EditSponsorPayload } from "~/app/dto/sponsor";

export class SponsorController {
  private sponsorService = new SponsorService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreateSponsorPayload, req.body);
    const sponsor = await this.sponsorService.createSponsor(payload);
    return res.send(ok(sponsor));
  }

  async getAll(req: Request, res: Response) {
    const sponsors = await this.sponsorService.getAllSponsors();
    return res.send(ok(sponsors));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const sponsor = await this.sponsorService.getSponsorById(id);
    return res.send(ok(sponsor));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditSponsorPayload, req.body);
    const sponsor = await this.sponsorService.updateSponsor(payload);
    return res.send(ok(sponsor));
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    await this.sponsorService.deleteSponsor(id);
    return res.send(ok());
  }
}