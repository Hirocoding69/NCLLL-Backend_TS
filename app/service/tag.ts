import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { TagModel } from "../entity/tag";
import { CreateTagPayload, EditTagPayload } from '../dto/tag';
import redis from '~/database/redis';

export class TagService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_TAGS: 'tags:all',
    TAG_BY_ID: (id: string) => `tag:${id}`
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    ALL_TAGS: 3600, // 1 hour
    SINGLE_TAG: 3600 // 1 hour
  };

  /**
   * Create a new tag
   * @param payload Tag creation data
   * @returns Newly created tag
   */
  async createTag(payload: CreateTagPayload) {
    const newTag = await TagModel.create({
      en: payload.en,
      kh: payload.kh,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Invalidate the all tags cache since we've added a new one
    await redis.del(this.CACHE_KEYS.ALL_TAGS);

    return newTag;
  }

  /**
   * Get all active tags
   * @returns Array of tags
   */
  async getAllTags() {
    return await redis.getWithFallback(
      this.CACHE_KEYS.ALL_TAGS,
      async () => {
        return await TagModel.find({ deleted_at: null })
          .sort({ 'created_at': -1 })
          .exec();
      },
      this.CACHE_DURATIONS.ALL_TAGS
    );
  }

  /**
   * Get a tag by ID
   * @param id Tag ID
   * @returns Tag document
   */
  async getTagById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid tag ID format");
    }

    return await redis.getWithFallback(
      this.CACHE_KEYS.TAG_BY_ID(id),
      async () => {
        const tag = await TagModel.findOne({
          _id: id,
          deleted_at: null
        });

        if (!tag) {
          throw notFound("Tag not found");
        }

        return tag;
      },
      this.CACHE_DURATIONS.SINGLE_TAG
    );
  }

  /**
   * Update a tag by ID
   * @param payload Tag update data with ID
   * @returns Updated tag
   */
  async updateTag(payload: EditTagPayload) {
    const { id, ...updateData } = payload;

    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid tag ID format");
    }

    const tag = await TagModel.findOne({
      _id: id,
      deleted_at: null
    });

    if (!tag) {
      throw notFound("Tag not found");
    }

    // Update tag info
    if (updateData.en) {
      tag.en = {
        ...(tag.en as any),
        ...updateData.en
      };
    }

    if (updateData.kh) {
      tag.kh = {
        ...(tag.kh as any),
        ...updateData.kh
      };
    }

    tag.updated_at = new Date();
    const updatedTag = await tag.save();

    // Invalidate caches after update
    await Promise.all([
      redis.del(this.CACHE_KEYS.TAG_BY_ID(id)),
      redis.del(this.CACHE_KEYS.ALL_TAGS)
    ]);

    return updatedTag;
  }

  /**
   * Soft delete a tag
   * @param id Tag ID
   * @returns Deleted tag
   */
  async deleteTag(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid tag ID format");
    }

    await TagModel.findOneAndDelete({
      _id: id,
    });

    // Invalidate caches after deletion
    await Promise.all([
      redis.del(this.CACHE_KEYS.TAG_BY_ID(id)),
      redis.del(this.CACHE_KEYS.ALL_TAGS)
    ]);
  }

  /**
   * Clear all tag-related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllTagCaches() {
    await redis.delWildcard('tag:*');
    await redis.del(this.CACHE_KEYS.ALL_TAGS);
  }
}