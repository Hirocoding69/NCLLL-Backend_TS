import express from "express";
import { AuthController } from "~/app/controller/v1/admin/auth";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { SponsorController } from "~/app/controller/v1/admin/sponsor";
import { CreateSponsorPayload, EditSponsorPayload } from "~/app/dto/sponsor";

const router = express.Router();
const ctrl = bindCtx(new SponsorController());

router.post("/", vbody(CreateSponsorPayload), ctrl.create);
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.patch("/", vbody(EditSponsorPayload), ctrl.update);
router.delete("/:id", ctrl.delete);

export default router;