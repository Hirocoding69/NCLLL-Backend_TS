import dotenv from "dotenv";

dotenv.config();

interface AppConfig {
  timezone: string;
  localTimezone: string;
}

export const appConfig: AppConfig = {
  timezone: process.env.APP_TIMEZONE || "UTC",
  localTimezone: process.env.APP_LOCAL_TIMEZONE || "Asia/Phnom_Penh",
};
