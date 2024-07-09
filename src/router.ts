import * as jsonpath from "jsonpath";

import type { Condition, Config, Destination } from "./schema";

const matchCond = (message: unknown) => (cond: Condition) => {
  const values = jsonpath.query(message, cond.path);
  if (values.length === 0) {
    return false;
  }

  // Construct matchers
  const matchers: ((v: unknown) => boolean)[] = [];
  if (cond.exact) {
    matchers.push((v: unknown) => v === cond.exact);
  }
  if (cond.match) {
    const pattern = cond.match;
    matchers.push((v: unknown) => typeof v === "string" && pattern.test(v));
  }

  // Apply matchers (AND)
  return values.every((v) => matchers.every((match) => match(v)));
};

export const findRoute = (c: Config, message: unknown): Destination | null =>
  c.targets.find((target) => target.conditions.every(matchCond(message)))
    ?.destination || null;
