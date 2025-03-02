import { IncomingMessage, Server, ServerResponse } from "http";
import { sleep } from ".";
import logger from "./logger";

type APP_STATE = "RUNNING" | "CLOSING";

let state: APP_STATE = "RUNNING";

export function appClosing() {
  state = "CLOSING";
}

export function isAppClosing() {
  return state === "CLOSING";
}

export async function shutdown(
  server: Server<typeof IncomingMessage, typeof ServerResponse>
) {
  server.close(async () => {
    if (process.env.NODE_ENV !== "local") {
      logger.info(
        "Termination Signal detected. Gracefully shutting app down.."
      );

      await sleep(20 * 1000);
      process.exit(0);
    } else {
      process.exit(0);
    }
  });
}
