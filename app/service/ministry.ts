import { Types } from 'mongoose';
import { notFound, unprocessableEntity } from "~/common/response";
import { MinistryInfo, MinistryModel } from "../entity/ministry";
import { CreateMinistryPayload, EditMinistryPayload } from '../dto/ministry';
import redis from '~/database/redis';

export class MinistryService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_MINISTRIES: 'ministries:all',
    MINISTRY_BY_ID: (id: string) => `ministry:${id}`
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    ALL_MINISTRIES: 3600, // 1 hour
    SINGLE_MINISTRY: 3600 // 1 hour
  };

  /**
   * Create a new ministry
   * @param payload Ministry creation data
   * @returns Newly created ministry
   */
  async createMinistry(payload: CreateMinistryPayload) {
    const existingMinistry = await MinistryModel.findOne({
      $or: [
        { "en.name": payload.en.name },
        { "kh.name": payload.kh.name }
      ]
    });
    if (existingMinistry) {
      throw unprocessableEntity("message.ministry_already_exists");
    }

    const newMinistry = await MinistryModel.create({
      en: payload.en,
      kh: payload.kh,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Invalidate the all ministries cache since we've added a new one
    await redis.del(this.CACHE_KEYS.ALL_MINISTRIES);

    return newMinistry;
  }

  /**
   * Get all ministries
   * @returns Array of ministries
   */
  async getAllMinistries() {
    return await redis.getWithFallback(
      this.CACHE_KEYS.ALL_MINISTRIES,
      async () => {
        return await MinistryModel.find()
          .sort({ 'created_at': -1 })
          .exec();
      },
      this.CACHE_DURATIONS.ALL_MINISTRIES
    );
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

    return await redis.getWithFallback(
      this.CACHE_KEYS.MINISTRY_BY_ID(id),
      async () => {
        const ministry = await MinistryModel.findById(id);

        if (!ministry) {
          throw notFound("Ministry not found");
        }

        return ministry;
      },
      this.CACHE_DURATIONS.SINGLE_MINISTRY
    );
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
    const updatedMinistry = await ministry.save();

    // Invalidate caches after update
    await this.invalidateMinistryCaches(id);

    return updatedMinistry;
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

    const result = await MinistryModel.findOne({ _id: id });

    if (!result) {
      throw notFound("message.ministry_not_found");
    }

    result.deleted_at = new Date();
    await result.save();

    // Invalidate caches after deletion
    await this.invalidateMinistryCaches(id);

    return result;
  }

  /**
   * Invalidate ministry-related caches
   * @param ministryId Optional specific ministry ID to invalidate
   */
  private async invalidateMinistryCaches(ministryId?: string) {
    const deletePromises = [
      // Always invalidate the all ministries cache
      redis.del(this.CACHE_KEYS.ALL_MINISTRIES)
    ];

    // If a specific ministry ID was provided, also invalidate that ministry's cache
    if (ministryId) {
      deletePromises.push(redis.del(this.CACHE_KEYS.MINISTRY_BY_ID(ministryId)));
    }

    await Promise.all(deletePromises);
  }

  /**
   * Clear all ministry-related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllMinistryCaches() {
    await Promise.all([
      redis.delWildcard('ministry:*'),
      redis.del(this.CACHE_KEYS.ALL_MINISTRIES)
    ]);
  }
}