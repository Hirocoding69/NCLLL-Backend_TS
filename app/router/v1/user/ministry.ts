import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { MinistryController } from "~/app/controller/v1/user/ministry";

const router = express.Router();
const ctrl = bindCtx(new MinistryController());

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);

export default router;