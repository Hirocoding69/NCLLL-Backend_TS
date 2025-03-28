import express from "express";
import { FocusAreaController } from "~/app/controller/v1/user/focus-area";
import { bindCtx } from "~/common/utils/bind";

const router = express.Router();
const ctrl = bindCtx(new FocusAreaController());

router.get("/", ctrl.getAll);

router.get("/:id", ctrl.getById);

export default router;