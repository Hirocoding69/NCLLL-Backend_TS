import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { BannerModel } from "../entity/banner";
import { CreateBannerPayload, EditBannerPayload } from '../dto/banner';

export class BannerService {
  /**
   * Create a new banner
   * @param payload Banner creation data
   * @returns Newly created banner
   */
  async createBanner(payload: CreateBannerPayload) {
    return await BannerModel.create({
      title: payload.title,
      imageUrl: payload.imageUrl,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Get all active banners
   * @returns Array of banners
   */
  async getAllBanners() {
    return await BannerModel.find({ deleted_at: null })
      .sort({ 'created_at': -1 })
      .exec();
  }

  /**
   * Get a banner by ID
   * @param id Banner ID
   * @returns Banner document
   */
  async getBannerById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid banner ID format");
    }

    const banner = await BannerModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!banner) {
      throw notFound("Banner not found");
    }
    
    return banner;
  }

  /**
   * Update a banner by ID
   * @param payload Banner update data with ID
   * @returns Updated banner
   */
  async updateBanner(payload: EditBannerPayload) {
    const { id, ...updateData } = payload;
    
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid banner ID format");
    }

    const banner = await BannerModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!banner) {
      throw notFound("Banner not found");
    }

    // Update banner fields
    Object.assign(banner, updateData);
    banner.updated_at = new Date();
    
    return await banner.save();
  }

  /**
   * Soft delete a banner
   * @param id Banner ID
   * @returns Deleted banner
   */
  async deleteBanner(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid banner ID format");
    }
    await BannerModel.findOneAndDelete({ _id: id });
  }
}