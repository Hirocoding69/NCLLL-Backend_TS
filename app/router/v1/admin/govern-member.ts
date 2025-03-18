import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { MemberController } from "~/app/controller/v1/admin/govern-member";
import { CreateMemberPayload, EditMemberPayload } from "~/app/dto/govern-member";

const router = express.Router();
const ctrl = bindCtx(new MemberController());

router.post("/", vbody(CreateMemberPayload), ctrl.create);
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.patch("/",vbody(EditMemberPayload), ctrl.update)
router.delete("/:id", ctrl.delete)


export default router;
