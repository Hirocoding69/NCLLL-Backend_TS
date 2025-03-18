import express from "express";

import AuthRoutes from "./auth";
import Position from "./position";

const router = express.Router();

router
  .use("/auth", AuthRoutes)
  .use("/position", Position);
 

export default router;
