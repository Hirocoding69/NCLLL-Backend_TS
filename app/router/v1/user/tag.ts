import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { TagController } from "~/app/controller/v1/user/tag";

const router = express.Router();
const ctrl = bindCtx(new TagController());

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

export default router;