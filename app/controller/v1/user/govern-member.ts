import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { MemberService } from "~/app/service/gov-member";
import { CreateMemberPayload, EditMemberPayload } from "~/app/dto/govern-member";

export class MemberController {
    private memberService = new MemberService();

    /**
     * Get all members
     */
    async getAll(req: Request, res: Response) {
        const populate = req.query.populate !== 'false';
        const members = await this.memberService.getAllMembers(populate);
        return res.send(ok(members));
    }

    /**
     * Get member by ID
     */
    async getById(req: Request, res: Response) {
        const id = req.params.id;
        const populate = req.query.populate !== 'false';
        const member = await this.memberService.getMemberById(id, populate);
        return res.send(ok(member));
    }
}