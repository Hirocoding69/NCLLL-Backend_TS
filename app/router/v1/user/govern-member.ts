import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { MemberController } from "~/app/controller/v1/user/govern-member";

const router = express.Router();
const ctrl = bindCtx(new MemberController());

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

export default router;
