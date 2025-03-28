import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { RequestPartnerController } from "~/app/controller/v1/user/request-partner";

const router = express.Router();
const ctrl = bindCtx(new RequestPartnerController());

router.post("/", ctrl.create);
router.get("/", ctrl.getAll);

export default router;