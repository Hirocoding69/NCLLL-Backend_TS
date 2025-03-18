import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { BannerController } from "~/app/controller/v1/admin/banner";
import { CreateBannerPayload, EditBannerPayload } from "~/app/dto/banner";

const router = express.Router();
const ctrl = bindCtx(new BannerController());

router.post("/", vbody(CreateBannerPayload), ctrl.create);
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.patch("/", vbody(EditBannerPayload), ctrl.update);
router.delete("/:id", ctrl.delete);

export default router;