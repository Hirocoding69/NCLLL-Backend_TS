import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { TagModel } from "../entity/tag";
import { WebsiteSettingsModel } from '../entity/website-settings';
import { EditWebsiteSettingsPayload } from '../dto/website-settings';

export class WebsiteSettingsService {

  /**
   * Get a one setting document
   * @returns Setting document
   */
  async getOne() {
    const websiteSettings = await WebsiteSettingsModel.findOne({});

    if (!websiteSettings) {
      const rsp = await WebsiteSettingsModel.create({ maintenanceMode: true });
      return rsp;
    }

    return websiteSettings;
  }

  /**
   * Update a setting document
   * @param payload setting update data
   * @returns Updated setting document
   */
  async updateSettings(payload: EditWebsiteSettingsPayload) {
    const { ...updateData } = payload;

    const websiteSettings = await WebsiteSettingsModel.findOneAndUpdate(
      {},
      { ...updateData },
      { new: true, upsert: true }
    );

    return websiteSettings;
  }
}