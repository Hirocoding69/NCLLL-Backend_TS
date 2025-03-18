import { notFound } from "~/common/response";
import { MemberInfo, MemberModel } from "../entity/gov-board-member";

export class MemberService {
  async createMember(en: MemberInfo, kh: MemberInfo) {
    return await MemberModel.create({ en, kh, created_at: new Date(), updated_at: new Date() });
  }

  async getAllMembers() {
    return await MemberModel.find({ deleted_at: null });
  }

  async getMemberById(id: string) {
    const member = await MemberModel.findOne({ _id: id, deleted_at: null });
    if (!member) {
      throw notFound("Member not found");
    }
    return member;
  }

  async updateMember(id: string, en?: MemberInfo, kh?: MemberInfo) {
    const member = await MemberModel.findOne({ _id: id, deleted_at: null });
    if (!member) {
      throw notFound("Member not found");
    }
    if (en) member.en = { ...member.en, ...en };
    if (kh) member.kh = { ...member.kh, ...kh };
    return await member.save();
  }

}
