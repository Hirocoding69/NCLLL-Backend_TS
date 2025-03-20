import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { TagInfo, TagModel } from "../entity/tag";
import { CreateTagPayload, EditTagPayload } from '../dto/tag';

export class TagService {
  /**
   * Create a new tag
   * @param payload Tag creation data
   * @returns Newly created tag
   */
  async createTag(payload: CreateTagPayload) {
    return await TagModel.create({
      en: payload.en,
      kh: payload.kh,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Get all active tags
   * @returns Array of tags
   */
  async getAllTags() {
    return await TagModel.find({ deleted_at: null })
      .sort({ 'created_at': -1 })
      .exec();
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

    const tag = await TagModel.findOne({ 
      _id: id, 
      deleted_at: null 
    });
    
    if (!tag) {
      throw notFound("Tag not found");
    }
    
    return tag;
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
    
    return await tag.save();
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
  }
}