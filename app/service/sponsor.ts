import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { SponsorInfo, SponsorModel } from "../entity/sponsor";
import { CreateSponsorPayload, EditSponsorPayload } from '../dto/sponsor';

export class SponsorService {
  /**
   * Create a new sponsor
   * @param payload Sponsor creation data
   * @returns Newly created sponsor
   */
  async createSponsor(payload: CreateSponsorPayload) {
    return await SponsorModel.create({
      en: payload.en,
      kh: payload.kh,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Get all active sponsors
   * @returns Array of sponsors
   */
  async getAllSponsors() {
    return await SponsorModel.find({ deleted_at: null })
      .sort({ 'created_at': -1 })
      .exec();
  }

  /**
   * Get a sponsor by ID
   * @param id Sponsor ID
   * @returns Sponsor document
   */
  async getSponsorById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid sponsor ID format");
    }

    const sponsor = await SponsorModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!sponsor) {
      throw notFound("Sponsor not found");
    }
    
    return sponsor;
  }

  /**
   * Update a sponsor by ID
   * @param payload Sponsor update data with ID
   * @returns Updated sponsor
   */
  async updateSponsor(payload: EditSponsorPayload) {
    const { id, ...updateData } = payload;
    
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid sponsor ID format");
    }

    const sponsor = await SponsorModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!sponsor) {
      throw notFound("Sponsor not found");
    }

    // Update sponsor info
    if (updateData.en) {
      sponsor.en = {
        ...(sponsor.en as any),
        ...updateData.en
      };
    }
    
    if (updateData.kh) {
      sponsor.kh = {
        ...(sponsor.kh as any),
        ...updateData.kh
      };
    }

    sponsor.updated_at = new Date();
    
    return await sponsor.save();
  }

  /**
   * Soft delete a sponsor
   * @param id Sponsor ID
   * @returns Deleted sponsor
   */
  async deleteSponsor(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid sponsor ID format");
    }
    await SponsorModel.findOneAndDelete({ _id: id });
  }
}