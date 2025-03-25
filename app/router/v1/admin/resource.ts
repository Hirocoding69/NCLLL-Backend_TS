import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody, vquery } from "~/common/middleware/validator";
import { ResourceController } from "~/app/controller/v1/admin/resource";
import { CreateResourcePayload, EditResourcePayload, ResourceQueryDto } from "~/app/dto/resource";

const router = express.Router();
const ctrl = bindCtx(new ResourceController());

router.get("/",vquery(ResourceQueryDto),ctrl.getResources);
router.get("/:id", ctrl.getById);
router.post("/", vbody(CreateResourcePayload), ctrl.create);
router.patch("/", vbody(EditResourcePayload), ctrl.update);
router.delete("/:id", ctrl.delete);

export default router;