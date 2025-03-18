import { Types } from 'mongoose';
import { notFound } from "~/common/response";
import { MemberInfo, MemberModel, PositionModel } from "../entity/gov-board-member";
import { CreateMemberPayload, EditMemberPayload } from '../dto/govern-member';

export class MemberService {
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

    return await MemberModel.create({
      en: payload.en,
      kh: payload.kh,
      position: payload.position,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  /**
   * Get all active members with optional population
   * @param populate Whether to populate the position reference
   * @returns Array of members
   */
  async getAllMembers(populate = true) {
    const query = MemberModel.find({ deleted_at: null });

    if (populate) {
      query.populate('position');
    }

    return await query.sort({ 'created_at': -1 }).exec();
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

    const query = MemberModel.findOne({
      _id: id,
      deleted_at: null
    });

    if (populate) {
      query.populate('position');
    }

    const member = await query.exec();

    if (!member) {
      throw notFound("Member not found");
    }

    return member;
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

    return await member.save();
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
  }
}