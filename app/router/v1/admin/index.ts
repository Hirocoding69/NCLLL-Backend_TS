import express from "express";

import AuthRoutes from "./auth";
import Position from "./position";
import MemberRoutes from "./govern-member";
import SponssorRoutes from "./sponsor";
import BannerRoutes from "./banner";
import TagRoutes from "./tag";
import MinistryRoutes from "./ministry";
import UploadRoutes from "./file";
import ResoureceRoutes from "./resource";
const router = express.Router();

router
  .use("/auth", AuthRoutes)
  .use("/position", Position)
  .use("/member", MemberRoutes)
  .use("/sponsor", SponssorRoutes)
  .use("/banner", BannerRoutes)
  .use("/tag", TagRoutes)
  .use("/ministry", MinistryRoutes)
  .use("/upload",UploadRoutes)
  .use("/resource",ResoureceRoutes);

 
export default router;
