import type { MessageBatch } from "@cloudflare/workers-types/2023-07-01";
import * as v from "valibot";

import { Config } from "./schema";
import { dispatch } from "./dispatch";
import { findRoute } from "./router";

interface RunOption {
  routeConfig?: string;
}

export const run = async (
  env: Record<string, unknown>,
  message: unknown,
  option?: RunOption,
) => {
  const routeConfig = option?.routeConfig || "ROUTE_CONFIG";
  const configString = env[routeConfig];
  if (!configString) {
    throw new Error(`cf-msgrouter: configuration(${routeConfig}) not found`);
  }
  if (typeof configString !== "string") {
    throw new Error(
      `cf-msgrouter: configuration(${routeConfig}) is not json formatted string`,
    );
  }
  const config = await v.parseAsync(Config, JSON.parse(configString));

  //
  const dest = findRoute(config, message);
  if (!dest) {
    throw new Error("cf-msgrouter: destination not found");
  }

  await dispatch(dest, env, message);
};

export const handleFetch = async <Env extends Record<string, unknown>>(
  request: Request,
  env: Env,
) => {
  const body = await request.json();
  await run(env, body);
};

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
