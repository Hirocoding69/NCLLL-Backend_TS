import express from "express";
import { CacheRoutes } from "./cache";
import { HealthCheckRoutes } from "./health-check";
import V1Router from "./v1";

const router = express.Router();

router.use(HealthCheckRoutes);
router.use(CacheRoutes);

router.use("/v1", V1Router);

export default router;
