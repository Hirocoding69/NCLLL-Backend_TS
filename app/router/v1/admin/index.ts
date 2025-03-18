import express from "express";

import AuthRoutes from "./auth";
import Position from "./position";
import MemberRoutes from "./govern-member";
import SponssorRoutes from "./sponsor";
const router = express.Router();

router
  .use("/auth", AuthRoutes)
  .use("/position", Position)
  .use("/member", MemberRoutes)
  .use("/sponsor", SponssorRoutes);
 
export default router;
