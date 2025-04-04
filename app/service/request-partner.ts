import { CreateRequestPartnerDTO } from '../dto/request-partner';
import { RequestPartnersModel } from '../entity/request-partners';

export class RequestPartnerService {
  /**
   * Create a new ministry
   * @param payload Ministry creation data
   * @returns Newly created ministry
   */
  async create(payload: CreateRequestPartnerDTO) {

    return await RequestPartnersModel.create({
      status: "pending",
      email: payload.email,
      reason: payload.reason,
      description: payload.description,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  /**
   * Get all partners
   * @returns All partners
   * 
   */
  async getAll() {
    return await RequestPartnersModel.find();
  }
}