import Redis from "ioredis";
import dotenv from "dotenv";
import { unprocessableEntity } from "~/common/response";

dotenv.config();

let redis: Redis;

async function initialize() {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: +(process.env.REDIS_PORT || 0),
    password: process.env.REDIS_PASSWORD,
  }).on("error", console.error);
}

/**
 * Reads a key and locks it for a specified period of time.
 * @param key - The Redis key to read.
 * @param lockKey - The Redis key used for the lock (can be derived from the main key).
 * @param lockDuration - The duration (in seconds) for which the lock will be active.
 * @returns The value of the Redis key or null if the key does not exist.
 */
async function readWithLock(
  key: string,
  lockKey: string,
  lockDuration: number,
  maxRetries: number = 10,
  retryDelay: number = 500
) {
  if (!redis) {
    throw unprocessableEntity(
      "Redis client is not initialized. Call initialize() first."
    );
  }

  const value = await redis.get(key);
  if (value === null) {
    return null;
  }

  let retries = 0;
  let lockAcquired = false;
  while (retries < maxRetries) {
    const result = await redis.set(lockKey, "1", "EX", lockDuration, "NX");

    if (result === "OK") {
      lockAcquired = true;
      break;
    }

    retries++;
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  if (lockAcquired) {
    return value;
  } else {
    throw unprocessableEntity(
      `Failed to acquire lock for key "${lockKey}" after ${maxRetries} retries.`
    );
  }
}

/**
 * Releases the lock for a specific key.
 * @param lockKey - The Redis key used for the lock.
 * @returns A boolean indicating whether the lock was successfully released.
 */
async function unlock(lockKey: string) {
  if (!redis) {
    throw new Error(
      "Redis client is not initialized. Call initialize() first."
    );
  }

  const result = await redis.del(lockKey);
  return result > 0;
}

async function get(key: string) {
  const result = await redis.get(key);
  return result;
}

async function set(key: string, value: string, durationSecond?: number) {
  let result;
  if (durationSecond) {
    result = await redis.set(key, value, "EX", durationSecond);
  } else {
    result = await redis.set(key, value);
  }
  return result;
}

async function del(key: string) {
  const set = await redis.del(key);
  return set;
}

/**
 * Returns 0 = key already exists, 1 = key is set
 * @param key
 * @param value
 * @param durationSecond
 * @returns
 */
async function setNx(key: string, value: string, durationSecond?: number) {
  const set = await redis.setnx(key, value);
  if (set && durationSecond) {
    await redis.expire(key, durationSecond);
  }

  return set;
}

async function delWildcard(pattern: string) {
  const keys = await redis.keys(pattern);
  if (!keys?.length) return 1;

  const result = await redis.del(keys);
  return result;
}

async function flushAll() {
  const result = await redis.flushall();
  return result;
}
/**
 *
 * @param lockKey which serves as a namespace for the lock in Redis
 * @param lockValue value to identify which node holds the lock
 * @param expireAfterInSeconds time to expire after acquiring the lock, which leads to releasing the lock automatically in case of crashes
 * @returns whether the lock has been acquired
 */
export async function acquireLock(
  lockKey: string,
  lockValue: string,
  expireAfterInSeconds: number,
  maxRetries: number = 30,
  retryIntervalInMs: number = 1
) {
  let attempt = 0;
  let result: string | null;

  while (attempt < maxRetries) {
    result = (await redis.call(
      "set",
      lockKey,
      lockValue,
      "NX",
      "EX",
      expireAfterInSeconds
    )) as string | null;

    if (result === "OK") {
      return true;
    }

    attempt++;
    await new Promise((resolve) => setTimeout(resolve, retryIntervalInMs));
  }

  return false;
}

export async function renewLock(
  lockKey: string,
  lockValue: string,
  expireAfterInSeconds: number
) {
  const result = await redis.get(lockKey);

  // Lock is available, we can attempt to acquire it again.
  if (result === null) {
    return acquireLock(lockKey, lockValue, expireAfterInSeconds);
  } else if (result === lockValue) {
    // we can safely renew it by extending its expiry time
    await redis.expire(lockKey, expireAfterInSeconds);
    return true;
  } else {
    throw new Error(
      "Lock held by another node. Can neither renew or acquire it"
    );
  }
}

export async function maybeReleaseLock(lockKey: string, lockValue: string) {
  const result = await redis.get(lockKey);
  if (result === lockValue) {
    await redis.del(lockKey);
  }
  // lock may exist, but it's held by another worker node.
  // This node should do nothing with it in this case.
}

export function getRedisClient() {
  return redis;
}

export default {
  initialize,
  get,
  set,
  del,
  setNx,
  delWildcard,
  flushAll,
  readWithLock,
  unlock,
  acquireLock,
  renewLock,
  maybeReleaseLock,
  getRedisClient,
};
