import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { PartnerController } from "~/app/controller/v1/admin/partner";
import { CreatePartnerPayload, EditPartnerPayload } from "~/app/dto/partner";

const router = express.Router();
const ctrl = bindCtx(new PartnerController());

// GET /partners - Get paginated partners with optional filtering
router.get("/", ctrl.getPartners);

// GET /partners/:id - Get specific partner by ID
router.get("/:id", ctrl.getById);

// POST /partners - Create a new partner
router.post("/", vbody(CreatePartnerPayload), ctrl.create);

// PATCH /partners - Update an existing partner
router.patch("/", vbody(EditPartnerPayload), ctrl.update);

// DELETE /partners/:id - Soft delete a partner (marks as deleted)
router.delete("/:id", ctrl.softDelete);

// DELETE /partners/:id/permanent - Permanently delete a partner
router.delete("/:id/permanent", ctrl.permanentDelete);

export default router;