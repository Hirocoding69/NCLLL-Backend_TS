import dotenv from "dotenv";

dotenv.config();

interface QueueConfig {
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  redisUser?: string;
}

export const queueConfig: QueueConfig = {
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379"),
  redisPassword: process.env.REDIS_PASSWORD,
  redisUser: process.env.REDIS_USER,
};
