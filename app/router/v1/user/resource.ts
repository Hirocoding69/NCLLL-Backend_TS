import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody, vquery } from "~/common/middleware/validator";
import { ResourceController } from "~/app/controller/v1/user/resource";
import {CombinedQueryDto, ResourceQueryDto } from "~/app/dto/resource";

const router = express.Router();
const ctrl = bindCtx(new ResourceController());

router.get("/",vquery(ResourceQueryDto),ctrl.getResources);
router.get("/all",vquery(ResourceQueryDto),ctrl.getAll);

router.get("/:id", ctrl.getById);


export default router;