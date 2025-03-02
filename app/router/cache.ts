import express, { Request, Response } from "express";
import { unauthorized } from "~/common/response";
import redis from "~/database/redis";

const router = express.Router();
router.post("/cache/del", (req: Request, res: Response) => {
  if (!req.body.type || !req.body.key || req.header("cache-key") !== "okbro") {
    throw unauthorized();
  }

  switch (req.body.type) {
    case "del":
      redis.del(req.body.key);
      break;
    case "wildcard":
      redis.delWildcard(req.body.key);
      break;
    case "flushall":
      redis.flushAll();
      break;
    default:
      throw unauthorized();
  }

  return res.send("ok");
});

export const CacheRoutes = router;
