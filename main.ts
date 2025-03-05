import express from "express";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nMware from "i18next-http-middleware";
import dotenv from "dotenv";
import "reflect-metadata";
if (process.env.NODE_ENV === "production") {
  require("module-alias/register");
}
import cors from "cors";
import http from "http";
import logger from "~/common/utils/logger";
import { loggerMiddleware } from "~/common/middleware/logger";
import cookieParser from "cookie-parser";
import path from "path";
import "~/common/utils/moment";
import redis from "./database/redis";
import { errorHandler } from "./common/handler/error";
import { connectDB } from "./database/mongodb/datasource";
const requestIp = require("@chienchheung/request-ip");
// i18n
i18next
  .use(Backend)
  .use(i18nMware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(process.cwd(), "locales", "{{lng}}.json"),
    },
    detection: {
      order: ["header", "querystring", "cookie"],
    },
    fallbackLng: "en",
  });
dotenv.config();

async function main() {
  try {
    // App
    const app = express();
    const port = process.env.APP_PORT || 3000;
    // DB
    await connectDB();
    await redis.initialize();
    // MW
    app.use(
      cors({
        origin: process.env.FRONTEND_URL || "*",
        credentials: true,
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(loggerMiddleware);
    app.use(requestIp.mw({ prioritize: ["cf-connecting-ip", "x-real-ip"] }));
    app.use(cookieParser());
    app.use(i18nMware.handle(i18next));
    const server = http.createServer(app);
    // delayed loading dependencies until fully setup
    const { default: router } = await import("~/app/router");
    app.use(router);
    // Error handler; jit jkut
    // https://expressjs.com/en/guide/error-handling.html
    app.use(errorHandler);
    server.listen(port, () => {
      logger.info(`Server is running at port ${port} ⚡️`);
    });
  } catch (error) {
    logger.error("Error in server startup:", error);
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main().catch(error => {
  logger.error("Failed to start server:", error);
  // Prevent immediate restart
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});