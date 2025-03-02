import express from "express";
import { AuthController } from "~/app/controller/v1/user/auth";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { ChangePasswordPayload, CompareSecondaryPasswordPayload, LoginPayload, RecoverPasswordPayload, RegisterPayload } from "~/app/dto/auth";

const router = express.Router();
const ctrl = bindCtx(new AuthController());



export default router;
