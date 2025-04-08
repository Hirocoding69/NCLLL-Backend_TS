import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { WebsiteSettingsController } from "~/app/controller/v1/admin/website-settings";
import { EditWebsiteSettingsPayload } from "~/app/dto/website-settings";

const router = express.Router();
const ctrl = bindCtx(new WebsiteSettingsController());

router.get("/", ctrl.getOne);
router.patch("/", vbody(EditWebsiteSettingsPayload), ctrl.update);

export default router;