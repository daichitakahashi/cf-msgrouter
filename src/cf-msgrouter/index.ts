import * as v from "valibot";

import { Config } from "./schema";
import { dispatch } from "./dispatch";
import { findRoute } from "./router";

export const run = async (
  env: Record<string, unknown>,
  message: Record<string, unknown>,
  option?: {
    routeConfig?: string;
  },
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
