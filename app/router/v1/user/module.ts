import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { ModuleController } from "~/app/controller/v1/admin/module";
import { CreateModulePayload, EditModulePayload } from "~/app/dto/module";

const router = express.Router();
const ctrl = bindCtx(new ModuleController());

router.get("/", ctrl.getAll);

router.get("/:id", ctrl.getById);


export default router;