import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { MinistryInfo, MinistryModel } from "../entity/ministry";
import { CreateMinistryPayload, EditMinistryPayload } from '../dto/ministry';

export class MinistryService {
  /**
   * Create a new ministry
   * @param payload Ministry creation data
   * @returns Newly created ministry
   */
  async createMinistry(payload: CreateMinistryPayload) {
    return await MinistryModel.create({
      en: payload.en,
      kh: payload.kh,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Get all ministries
   * @returns Array of ministries
   */
  async getAllMinistries() {
    return await MinistryModel.find()
      .sort({ 'created_at': -1 })
      .exec();
  }

  /**
   * Get a ministry by ID
   * @param id Ministry ID
   * @returns Ministry document
   */
  async getMinistryById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid ministry ID format");
    }

    const ministry = await MinistryModel.findById(id);
    
    if (!ministry) {
      throw notFound("Ministry not found");
    }
    
    return ministry;
  }

  /**
   * Update a ministry by ID
   * @param payload Ministry update data with ID
   * @returns Updated ministry
   */
  async updateMinistry(payload: EditMinistryPayload) {
    const { id, ...updateData } = payload;
    
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid ministry ID format");
    }

    const ministry = await MinistryModel.findById(id);
    
    if (!ministry) {
      throw notFound("Ministry not found");
    }

    // Update ministry info
    if (updateData.en) {
      ministry.en = {
        ...(ministry.en as any),
        ...updateData.en
      };
    }
    
    if (updateData.kh) {
      ministry.kh = {
        ...(ministry.kh as any),
        ...updateData.kh
      };
    }

    ministry.updated_at = new Date();
    
    return await ministry.save();
  }

  /**
   * Delete a ministry permanently
   * @param id Ministry ID
   * @returns Deletion result
   */
  async deleteMinistry(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid ministry ID format");
    }

    const result = await MinistryModel.findOneAndDelete({ _id: id });
    
    if (!result) {
      throw notFound("Ministry not found");
    }
    
    return result;
  }
}