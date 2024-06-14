import type { Fetcher, Queue } from "@cloudflare/workers-types/2023-07-01";

import type { Destination } from "./schema";

const assertNever = (_: never) => {};

export const dispatch = async (
  dest: Destination,
  env: Record<string, unknown>,
  message: unknown,
) => {
  switch (dest.type) {
    case "queue": {
      const queue = env[dest.queue];
      if (!queue) {
      }
      await (queue as unknown as Queue).send(message, {
        delaySeconds: dest.delaySeconds,
      });
      break;
    }

    case "url": {
      const fetchFn = (() => {
        if (dest.service) {
          const fetcher = env[dest.service];
          if (!fetcher) {
            throw new Error(`cf-msgrouter: fetcher ${dest.service} not found`);
          }
          return (fetcher as Fetcher).fetch;
        }
        return fetch;
      })();

      const resp = await fetchFn(dest.url, {
        method: dest.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      if (!resp.ok) {
        throw new Error(`cf-msgrouter: received status code = ${resp.status}`);
      }
      break;
    }

    default:
      assertNever(dest);
  }
};
