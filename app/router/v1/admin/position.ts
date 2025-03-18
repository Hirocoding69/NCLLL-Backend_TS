import express from "express";
import { AuthController } from "~/app/controller/v1/admin/auth";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { PositionController } from "~/app/controller/v1/admin/position";
import { CreatePositionPayload, EditPositionPayload } from "~/app/dto/position";

const router = express.Router();
const ctrl = bindCtx(new PositionController());

router.post("/", vbody(CreatePositionPayload), ctrl.create);
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.patch("/",vbody(EditPositionPayload), ctrl.update);
router.delete("/:id", ctrl.delete);


export default router;
