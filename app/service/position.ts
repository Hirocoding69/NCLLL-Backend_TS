import { notFound, unprocessableEntity } from "~/common/response";
import { PositionModel } from "../entity/gov-board-member";
import { CreatePositionPayload, EditPositionPayload } from "../dto/position";
import redis from '~/database/redis';

export class PositionService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_POSITIONS: 'positions:all',
    POSITION_BY_ID: (id: string) => `position:${id}`
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    ALL_POSITIONS: 3600, // 1 hour
    SINGLE_POSITION: 3600 // 1 hour
  };

  async create(payload: CreatePositionPayload) {
    const existingPosition = await PositionModel.findOne({
      $or: [
        { "en.title": payload.en.title, "en.level": payload.en.level },
        { "kh.title": payload.kh.title, "kh.level": payload.kh.level },
      ],
    });
    if (existingPosition) {
      throw unprocessableEntity("message.position_already_exist");
    }
    try {
      const newPosition = await PositionModel.create(payload);

      // Invalidate cache after creating a new position
      await this.invalidatePositionCaches();

      return newPosition;
    } catch (error: any) {
      if (error.code === 11000) { // Handle MongoDB unique constraint error
        throw unprocessableEntity("message.position_already_exist");
      }
      throw error;
    }
  }

  async getAll() {
    return await redis.getWithFallback(
      this.CACHE_KEYS.ALL_POSITIONS,
      async () => {
        return await PositionModel.find({ deleted_at: null });
      },
      this.CACHE_DURATIONS.ALL_POSITIONS
    );
  }

  async get(id: string) {
    return await redis.getWithFallback(
      this.CACHE_KEYS.POSITION_BY_ID(id),
      async () => {
        const position = await PositionModel.findById(id);
        if (!position) {
          throw notFound("message.not_found");
        }
        return position;
      },
      this.CACHE_DURATIONS.SINGLE_POSITION
    );
  }

  async update(payload: EditPositionPayload) {
    const { id, en, kh } = payload;
    const position = await PositionModel.findById(id);
    if (!position) {
      throw notFound("message.not_found");
    }

    if (en || kh) {
      const queryConditions: any[] = [];

      if (en?.title !== undefined && en?.level !== undefined) {
        queryConditions.push({ "en.title": en.title, "en.level": en.level });
      }

      if (kh?.title !== undefined && kh?.level !== undefined) {
        queryConditions.push({ "kh.title": kh.title, "kh.level": kh.level });
      }

      if (queryConditions.length > 0) {
        const existingPosition = await PositionModel.findOne({
          _id: { $ne: id },
          $or: queryConditions,
        });

        if (existingPosition) {
          throw unprocessableEntity("message.position_already_exist");
        }
      }
    }

    // Apply the updates
    if (en) {
      if (en.title) position.en.title = en.title;
      if (en.level !== undefined) position.en.level = en.level;
    }

    if (kh) {
      if (kh.title) position.kh.title = kh.title;
      if (kh.level !== undefined) position.kh.level = kh.level;
    }

    try {
      const updatedPosition = await position.save();

      // Invalidate caches after update
      await this.invalidatePositionCaches(id);

      return updatedPosition;
    } catch (error: any) {
      if (error.code === 11000) {
        throw unprocessableEntity("message.position_already_exist");
      }
      throw error;
    }
  }

  async delete(id: string) {
    await PositionModel.findOneAndDelete({ _id: id });

    // Invalidate caches after deletion
    await this.invalidatePositionCaches(id);
  }

  /**
   * Invalidate position-related caches
   * @param positionId Optional specific position ID to invalidate
   */
  private async invalidatePositionCaches(positionId?: string) {
    const deletePromises = [
      // Always invalidate the all positions cache
      redis.del(this.CACHE_KEYS.ALL_POSITIONS)
    ];

    // If a specific position ID was provided, also invalidate that position's cache
    if (positionId) {
      deletePromises.push(redis.del(this.CACHE_KEYS.POSITION_BY_ID(positionId)));
    }

    await Promise.all(deletePromises);
  }

  /**
   * Clear all position-related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllPositionCaches() {
    await Promise.all([
      redis.delWildcard('position:*'),
      redis.del(this.CACHE_KEYS.ALL_POSITIONS)
    ]);
  }
}