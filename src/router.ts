import * as jsonpath from "jsonpath";

import type { Config, Destination } from "./schema";

export const findRoute = (
  c: Config,
  message: Record<string, unknown>,
): Destination | null => {
  for (const target of c.targets) {
    if (!target.path) {
      return target.destination;
    }
    const matches = jsonpath.query(message, target.path);
    if (matches.length === 0) {
      continue;
    }

    // Construct matchers
    const matchers: ((v: unknown) => boolean)[] = [];
    if (target.exact) {
      matchers.push((v: unknown) => v === target.exact);
    }
    if (target.match) {
      const pattern = target.match;
      matchers.push((v: unknown) => typeof v === "string" && pattern.test(v));
    }

    // Apply matchers (AND)
    const matched = matches.every((matched) =>
      matchers.reduce((result, matcher) => result && matcher(matched), true),
    );
    if (matched) {
      return target.destination;
    }
  }
  return null;
};
