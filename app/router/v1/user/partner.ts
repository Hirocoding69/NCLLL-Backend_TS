import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { PartnerController } from "~/app/controller/v1/admin/partner";
import { CreatePartnerPayload, EditPartnerPayload } from "~/app/dto/partner";

const router = express.Router();
const ctrl = bindCtx(new PartnerController());

router.get("/", ctrl.getPartners);

export default router;