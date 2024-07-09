import type { Fetcher, Queue } from "@cloudflare/workers-types";

import type { Destination } from "./schema";
import { ConfigurationError, DispatchError } from "./error";

export const dispatch = async (
  dest: Destination,
  env: Record<string, unknown>,
  message: unknown,
) => {
  switch (dest.type) {
    // Route to Queue
    case "queue": {
      const queue = env[dest.queue];
      if (!queue) {
        throw new ConfigurationError(
          "invalidConfiguration",
          `destination queue '${dest.queue}' not found in bindings`,
        );
      }
      await (queue as unknown as Queue)
        .send(message, {
          delaySeconds: dest.delaySeconds,
        })
        .catch(() => {
          throw new DispatchError(
            "dispatchFailed",
            "failed to enqueue message",
            dest.queue,
          );
        });
      break;
    }

    // Route to Fetcher or url
    case "url": {
      const fetchFn = (() => {
        if (dest.service) {
          const fetcher = env[dest.service];
          if (!fetcher) {
            throw new ConfigurationError(
              "invalidConfiguration",
              `destination service '${dest.service}' not found in bindings`,
            );
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
        throw new DispatchError(
          "dispatchFailed",
          `received status code = ${resp.status}`,
          dest.service
            ? `${dest.service} ${dest.method} ${dest.url}`
            : `${dest.method} ${dest.url}`,
        );
      }
      break;
    }

    default: {
      const _: never = dest;
    }
  }
};
