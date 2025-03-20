import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { TagController } from "~/app/controller/v1/admin/tag";
import { CreateTagPayload, EditTagPayload } from "~/app/dto/tag";

const router = express.Router();
const ctrl = bindCtx(new TagController());

router.post("/", vbody(CreateTagPayload), ctrl.create);
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.patch("/", vbody(EditTagPayload), ctrl.update);
router.delete("/:id", ctrl.softDelete);

export default router;