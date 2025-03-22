import express from "express";
import { AuthController } from "~/app/controller/v1/user/auth";
import { bindCtx } from "~/common/utils/bind";
import { vbody } from "~/common/middleware/validator";
import { ChangePasswordPayload, LoginPayload} from "~/app/dto/auth";

const router = express.Router();
const ctrl = bindCtx(new AuthController());



export default router;
