import type { MessageBatch } from "@cloudflare/workers-types";

import { Config } from "./schema";
import { dispatch } from "./dispatch";
import { findRoute } from "./router";
import { ConfigurationError, DispatchError } from "./error";

export interface RunOption {
  routeConfig?: string;
  errorOnUnknownMessage: boolean;
}

export const run = async (
  env: Record<string, unknown>,
  message: unknown,
  option?: RunOption,
) => {
  // Parse configuration.
  const routeConfig = option?.routeConfig || "ROUTE_CONFIG";
  const configString = env[routeConfig];
  if (!configString) {
    throw new ConfigurationError(
      "configurationNotFound",
      `configuration(${routeConfig}) not found`,
    );
  }
  if (typeof configString !== "string") {
    throw new ConfigurationError(
      "invalidConfiguration",
      "configuration is not valid json",
    );
  }
  const config = await Config.parseAsync(JSON.parse(configString)).catch(() => {
    throw new ConfigurationError(
      "invalidConfiguration",
      "failed to parse configuration",
    );
  });

  // Find matched destination;
  const dest = findRoute(config, message);
  if (!dest) {
    if (option?.errorOnUnknownMessage) {
      throw new DispatchError("destinationNotFound", "destination not found");
    }
    return; // discard
  }

  await dispatch(dest, env, message);
};

export const handleFetch = <Env extends Record<string, unknown>>(
  request: Request,
  env: Env,
) =>
  request
    .json()
    .catch(() => new Response(null, { status: 400 }))
    .then((body) => run(env, body))
    .then(() => new Response(null, { status: 200 }))
    .catch((e) => {
      const [message, status] = (() => {
        if (e instanceof ConfigurationError) {
          return [e.message, 500] as const;
        }
        if (e instanceof DispatchError) {
          switch (e.type) {
            case "destinationNotFound":
              return [e.message, 404] as const;
            case "dispatchFailed":
              return [e.message, 500] as const;
          }
        }
        return ["internal server error", 500] as const;
      })();

      return new Response(
        JSON.stringify({
          error: message,
        }),
        { status },
      );
    });

export const handleQueue = async <Env extends Record<string, unknown>>(
  batch: MessageBatch,
  env: Env,
) => {
  for (const message of batch.messages) {
    await run(env, message.body)
      .then(() => message.ack())
      .catch(() => message.retry());
  }
};
