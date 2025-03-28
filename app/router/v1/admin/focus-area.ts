import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { FocusAreaController } from "~/app/controller/v1/admin/focus-area";
import { CreateFocusAreaPayload, EditFocusAreaPayload } from "~/app/dto/focus-area";

const router = express.Router();
const ctrl = bindCtx(new FocusAreaController());

router.get("/", ctrl.getAll);

router.get("/:id", ctrl.getById);

router.post("/", vbody(CreateFocusAreaPayload), ctrl.create);

router.patch("/", vbody(EditFocusAreaPayload), ctrl.update);

router.delete("/:id", ctrl.softDelete);

export default router;