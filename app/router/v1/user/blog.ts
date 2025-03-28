
import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vquery } from "~/common/middleware/validator";
import { CreateContentPayload, EditContentPayload, GetContentQueryParams } from "~/app/dto/blog";
import { ContentController } from "~/app/controller/v1/user/blog";

const router = express.Router();
const ctrl = bindCtx(new ContentController());

router.get("/", vquery(GetContentQueryParams), ctrl.getAll);
router.get("/:id", ctrl.getById);

export default router;