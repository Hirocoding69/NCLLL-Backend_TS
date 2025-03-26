import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody, vquery } from "~/common/middleware/validator";
import { authMiddleware } from "~/common/middleware/auth";
import { ContentController } from "~/app/controller/v1/admin/blog";
import { CreateContentPayload, EditContentPayload, GetContentQueryParams } from "~/app/dto/blog";

const router = express.Router();
const ctrl = bindCtx(new ContentController());

router.post("/", vbody(CreateContentPayload), ctrl.create);
router.get("/", vquery(GetContentQueryParams), ctrl.getAll);
router.get("/search", ctrl.search);
router.get("/:id", ctrl.getById);
router.patch("/", vbody(EditContentPayload), ctrl.update);
router.delete("/soft/:id", ctrl.softDelete);
router.delete("/hard/:id", ctrl.hardDelete);

export default router;