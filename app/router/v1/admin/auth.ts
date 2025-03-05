import express from "express";
import { AuthController } from "~/app/controller/v1/admin/auth";
import { bindCtx } from "~/common/utils/bind";

const router = express.Router();
const ctrl = bindCtx(new AuthController());

router
  .get("/me", ()=>{console.log("test")})
  .post("/login", ctrl.login)
  .post("/seed", ctrl.seedAdminAccount);

export default router;
