import express from "express";

import AdminRoutes from "./admin";
import UserRoutes from "./user";
import { authMiddleware } from "~/common/middleware/auth";

const router = express.Router();

router
  .use("/a", authMiddleware("admin"), AdminRoutes)
  .use("/u", authMiddleware("app"), UserRoutes);

export default router;
