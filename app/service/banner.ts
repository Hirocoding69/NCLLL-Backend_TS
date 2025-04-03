import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { BannerModel } from "../entity/banner";
import { CreateBannerPayload, EditBannerPayload } from '../dto/banner';
import redis from '~/database/redis';

export class BannerService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_BANNERS: 'banners:all',
    BANNER_BY_ID: (id: string) => `banner:${id}`
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    ALL_BANNERS: 3600, // 1 hour
    SINGLE_BANNER: 3600 // 1 hour
  };

  /**
   * Create a new banner
   * @param payload Banner creation data
   * @returns Newly created banner
   */
  async createBanner(payload: CreateBannerPayload) {
    const newBanner = await BannerModel.create({
      title: payload.title,
      imageUrl: payload.imageUrl,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Invalidate the all banners cache since we've added a new one
    await redis.del(this.CACHE_KEYS.ALL_BANNERS);

    return newBanner;
  }

  /**
   * Get all active banners
   * @returns Array of banners
   */
  async getAllBanners() {
    return await redis.getWithFallback(
      this.CACHE_KEYS.ALL_BANNERS,
      async () => {
        return await BannerModel.find({ deleted_at: null })
          .sort({ 'created_at': -1 })
          .exec();
      },
      this.CACHE_DURATIONS.ALL_BANNERS
    );
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

    return await redis.getWithFallback(
      this.CACHE_KEYS.BANNER_BY_ID(id),
      async () => {
        const banner = await BannerModel.findOne({
          _id: id,
          deleted_at: null
        });

        if (!banner) {
          throw notFound("Banner not found");
        }

        return banner;
      },
      this.CACHE_DURATIONS.SINGLE_BANNER
    );
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

    const updatedBanner = await banner.save();

    // Invalidate caches after update
    await this.invalidateBannerCaches(id);

    return updatedBanner;
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

    // Invalidate caches after deletion
    await this.invalidateBannerCaches(id);
  }

  /**
   * Invalidate banner-related caches
   * @param bannerId Optional specific banner ID to invalidate
   */
  private async invalidateBannerCaches(bannerId?: string) {
    const deletePromises = [
      // Always invalidate the all banners cache
      redis.del(this.CACHE_KEYS.ALL_BANNERS)
    ];

    // If a specific banner ID was provided, also invalidate that banner's cache
    if (bannerId) {
      deletePromises.push(redis.del(this.CACHE_KEYS.BANNER_BY_ID(bannerId)));
    }

    await Promise.all(deletePromises);
  }

  /**
   * Clear all banner-related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllBannerCaches() {
    await Promise.all([
      redis.delWildcard('banner:*'),
      redis.del(this.CACHE_KEYS.ALL_BANNERS)
    ]);
  }
}