import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { BannerController } from "~/app/controller/v1/user/banner";

const router = express.Router();
const ctrl = bindCtx(new BannerController());

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

export default router;