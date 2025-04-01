import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { ModuleController } from "~/app/controller/v1/admin/module";
import { CreateModulePayload, EditModulePayload } from "~/app/dto/module";

const router = express.Router();
const ctrl = bindCtx(new ModuleController());

router.get("/", ctrl.getAll);

router.get("/:id", ctrl.getById);

router.get("/categories/main", ctrl.getMainCategories);

router.get("/categories/sub/:mainCategory", ctrl.getSubCategories);

router.post("/", vbody(CreateModulePayload), ctrl.create);

router.patch("/", vbody(EditModulePayload), ctrl.update);

router.delete("/:id", ctrl.softDelete);

export default router;