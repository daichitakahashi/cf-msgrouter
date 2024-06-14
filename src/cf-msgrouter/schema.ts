import * as v from "valibot";

const DestinationQueue = v.object({
  type: v.literal("queue"),
  queue: v.pipe(v.string(), v.minLength(1)),
  delaySeconds: v.optional(v.number()),
});
export type DestinationQueue = v.InferOutput<typeof DestinationQueue>;

export const DestinationUrl = v.object({
  type: v.literal("url"),
  url: v.pipe(v.string(), v.url()),
  method: v.optional(v.string(), "GET"),
  service: v.optional(v.string()),
});
export type DestinationUrl = v.InferOutput<typeof DestinationUrl>;

export const Destination = v.union([DestinationQueue, DestinationUrl]);
export type Destination = v.InferOutput<typeof Destination>;

const Condition = v.object({
  path: v.pipe(v.string(), v.minLength(1)),
  exact: v.optional(v.unknown()),
  match: v.optional(
    v.pipe(
      v.string(),
      v.transform((s) => new RegExp(s)),
    ),
  ),
});
export type Condition = v.InferOutput<typeof Condition>;

const Target = v.object({
  conditions: v.array(Condition),
  destination: Destination,
});
export type Target = v.InferOutput<typeof Target>;

export const Config = v.object({
  targets: v.array(Target),
});
export type Config = v.InferOutput<typeof Config>;
