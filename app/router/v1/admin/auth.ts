import express from "express";
import { AuthController } from "~/app/controller/v1/admin/auth";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { LoginPayload } from "~/app/dto/auth";

const router = express.Router();
const ctrl = bindCtx(new AuthController());

router
  .post("/login", vbody(LoginPayload), ctrl.login)
  .post("/seed", ctrl.seedAdminAccount);

export default router;
