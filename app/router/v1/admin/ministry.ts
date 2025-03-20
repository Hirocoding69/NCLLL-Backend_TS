import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { MinistryController } from "~/app/controller/v1/admin/ministry";
import { CreateMinistryPayload, EditMinistryPayload } from "~/app/dto/ministry";

const router = express.Router();
const ctrl = bindCtx(new MinistryController());

router.post("/", vbody(CreateMinistryPayload), ctrl.create);
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.patch("/", vbody(EditMinistryPayload), ctrl.update);
router.delete("/:id", ctrl.softDelete);

export default router;