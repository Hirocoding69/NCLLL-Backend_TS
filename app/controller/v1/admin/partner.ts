import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { PartnerService } from "~/app/service/partner";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { CreatePartnerPayload, EditPartnerPayload, PartnerQueryDto } from "~/app/dto/partner";

export class PartnerController {
  private partnerService = new PartnerService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreatePartnerPayload, req.body);
    const partner = await this.partnerService.createPartner(payload);
    return res.send(ok(partner));
  }

  async getPartners(req: Request, res: Response) {
    const queryDto = plainToInstance(PartnerQueryDto, req.query);
    const paginatedResult = await this.partnerService.getPartners(queryDto);
    return res.send(ok(paginatedResult));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const partner = await this.partnerService.getPartnerById(id);
    return res.send(ok(partner));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditPartnerPayload, req.body);
    const partner = await this.partnerService.updatePartner(payload);
    return res.send(ok(partner));
  }

  async softDelete(req: Request, res: Response) {
    const id = req.params.id;
    await this.partnerService.deletePartner(id);
    return res.send(ok());
  }

  async permanentDelete(req: Request, res: Response) {
    const id = req.params.id;
    await this.partnerService.permanentDeletePartner(id);
    return res.send(ok());
  }
}