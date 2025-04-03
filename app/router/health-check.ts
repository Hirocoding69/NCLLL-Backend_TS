import express, { Request, Response } from "express";

const router = express.Router();
router.get("/health-check", (_: Request, res: Response) => {
  return res.send("hello");
});

export const HealthCheckRoutes = router;
