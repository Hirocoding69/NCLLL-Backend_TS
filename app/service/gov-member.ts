import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { Member, MemberInfo, MemberModel, PositionModel } from "../entity/gov-board-member";
import { CreateMemberPayload, EditMemberPayload } from '../dto/govern-member';
import { Ref } from '@typegoose/typegoose';
import redis from '~/database/redis';

export class MemberService {
  // Redis cache keys
  private readonly CACHE_KEYS = {
    ALL_MEMBERS: 'members:all',
    GROUPED_MEMBERS: 'members:grouped',
    MEMBER_BY_ID: (id: string) => `member:${id}`
  };

  // Cache durations (in seconds)
  private readonly CACHE_DURATIONS = {
    ALL_MEMBERS: 3600, // 1 hour
    GROUPED_MEMBERS: 3600, // 1 hour
    SINGLE_MEMBER: 3600 // 1 hour
  };

  /**
   * Create a new member
   * @param payload Member creation data
   * @returns Newly created member
   */
  async createMember(payload: CreateMemberPayload) {
    const positionExists = await PositionModel.exists({ _id: payload.position });
    if (!positionExists) {
      throw notFound("Position not found");
    }

    const member = await MemberModel.create({
      en: payload.en,
      kh: payload.kh,
      parent: payload.parent,
      position: payload.position,
      created_at: new Date(),
      updated_at: new Date()
    });

    const populatedMember = await member.populate("position");

    // Invalidate member caches
    await this.invalidateMemberCaches();

    return populatedMember;
  }

  /**
   * Get all active members with optional population
   * @param populate Whether to populate the position reference
   * @returns Array of members
   */
  async getAllMembers(populate = true) {
    const cacheKey = populate ? this.CACHE_KEYS.ALL_MEMBERS : `${this.CACHE_KEYS.ALL_MEMBERS}:unpopulated`;

    return await redis.getWithFallback(
      cacheKey,
      async () => {
        const query = MemberModel.find({ deleted_at: null });

        if (populate) {
          query.populate(['position', 'parent']);
        }

        return await query.sort({ 'created_at': -1 }).exec();
      },
      this.CACHE_DURATIONS.ALL_MEMBERS
    );
  }

  /**
   * Get all active members with only mandatory key & groups key
   * @returns Array of members
   */
  async getAllGroupedMembers() {
    return await redis.getWithFallback(
      this.CACHE_KEYS.GROUPED_MEMBERS,
      async () => {
        const query = MemberModel.aggregate([
          { $match: { deleted_at: null } },
          {
            $group: {
              _id: "$position",
              members: {
                $push: {
                  _id: "$_id",
                  name_en: "$en.name",
                  name_kh: "$kh.name",
                  imageUrl_en: "$en.imageUrl",
                  imageUrl_kh: "$kh.imageUrl",
                }
              }
            }
          },
          { $lookup: { from: "positions", localField: "_id", foreignField: "_id", as: "position" } },
          { $unwind: { path: "$position" } },
          { $sort: { "position.en.level": 1 } },
        ]);

        return await query;
      },
      this.CACHE_DURATIONS.GROUPED_MEMBERS
    );
  }

  /**
   * Get a member by ID
   * @param id Member ID
   * @param populate Whether to populate the position reference
   * @returns Member document
   */
  async getMemberById(id: string, populate = true) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid member ID format");
    }

    const cacheKey = populate ?
      this.CACHE_KEYS.MEMBER_BY_ID(id) :
      `${this.CACHE_KEYS.MEMBER_BY_ID(id)}:unpopulated`;

    return await redis.getWithFallback(
      cacheKey,
      async () => {
        const query = MemberModel.findOne({
          _id: id,
          deleted_at: null
        });

        if (populate) {
          query.populate(['position', 'parent']);
        }

        const member = await query.exec();

        if (!member) {
          throw notFound("Member not found");
        }

        return member;
      },
      this.CACHE_DURATIONS.SINGLE_MEMBER
    );
  }

  /**
   * Update a member by ID
   * @param payload Member update data with ID
   * @returns Updated member
   */
  async updateMember(payload: EditMemberPayload) {
    const { id, position, ...updateData } = payload;

    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid member ID format");
    }

    // Verify member exists
    const member = await MemberModel.findOne({
      _id: id,
      deleted_at: null
    });

    if (!member) {
      throw notFound("Member not found");
    }

    // If position is being updated, verify it exists
    if (position && position !== member.position.toString()) {
      const positionExists = await PositionModel.exists({ _id: position });
      if (!positionExists) {
        throw notFound("Position not found");
      }
      member.position = position as any;
    }

    if (updateData.parent) {
      const parent = await MemberModel.findOne({ _id: updateData.parent });
      if (!parent) {
        throw notFound("Parent not found");
      }
      member.parent = new Types.ObjectId(updateData.parent) as unknown as Ref<Member>;
    }

    // Update member info
    if (updateData.en) {
      member.en = {
        ...(member.en as any),
        ...updateData.en
      };
    }

    if (updateData.kh) {
      member.kh = {
        ...(member.kh as any),
        ...updateData.kh
      };
    }

    const updatedMember = await member.save().then((m) => m.populate(['position', 'parent']));

    // Invalidate related caches
    await this.invalidateMemberCaches(id);

    return updatedMember;
  }

  /**
   * Delete a member by ID
   * @param id Member ID
   * @returns Deleted member
   */
  async deleteMember(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid member ID format");
    }

    await MemberModel.findByIdAndDelete(id);

    // Invalidate related caches
    await this.invalidateMemberCaches(id);
  }

  /**
   * Invalidate member-related caches
   * @param memberId Optional specific member ID to invalidate
   */
  private async invalidateMemberCaches(memberId?: string) {
    const deletePromises = [
      // Always invalidate list and grouped caches
      redis.del(this.CACHE_KEYS.ALL_MEMBERS),
      redis.del(`${this.CACHE_KEYS.ALL_MEMBERS}:unpopulated`),
      redis.del(this.CACHE_KEYS.GROUPED_MEMBERS)
    ];

    // If a specific member ID was provided, also invalidate that member's cache variants
    if (memberId) {
      deletePromises.push(redis.del(this.CACHE_KEYS.MEMBER_BY_ID(memberId)));
      deletePromises.push(redis.del(`${this.CACHE_KEYS.MEMBER_BY_ID(memberId)}:unpopulated`));
    }

    await Promise.all(deletePromises);
  }

  /**
   * Clear all member-related caches
   * This can be useful for admin operations or when doing bulk updates
   */
  async clearAllMemberCaches() {
    await Promise.all([
      redis.delWildcard('member:*'),
      redis.del(this.CACHE_KEYS.ALL_MEMBERS),
      redis.del(`${this.CACHE_KEYS.ALL_MEMBERS}:unpopulated`),
      redis.del(this.CACHE_KEYS.GROUPED_MEMBERS)
    ]);
  }
}