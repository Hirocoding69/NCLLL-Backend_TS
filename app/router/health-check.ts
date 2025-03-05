import express, { Request, Response } from "express";

const router = express.Router();
router.get("/health-check", (_: Request, res: Response) => {
  return res.send("hello");
});

// router.get("/health-check2", async (_: Request, res: Response) => {
//   const svc = new OrderSettlementService();
//   await svc.pollAndProcessQueueMessage();
//   return res.send("hello");
// });

export const HealthCheckRoutes = router;
