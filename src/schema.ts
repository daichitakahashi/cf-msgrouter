import { z } from "zod";

const DestinationQueue = z.object({
  type: z.literal("queue"),
  queue: z.string().min(1),
  delaySeconds: z.number().optional(),
});
export type DestinationQueue = z.infer<typeof DestinationQueue>;

export const DestinationUrl = z.object({
  type: z.literal("url"),
  url: z.string().url(),
  method: z.string().optional().default("POST"),
  service: z.string().optional(),
});
export type DestinationUrl = z.infer<typeof DestinationUrl>;

export const Destination = z.union([DestinationQueue, DestinationUrl]);
export type Destination = z.infer<typeof Destination>;

const Condition = z.object({
  path: z.string().min(1),
  exact: z.unknown().optional(),
  match: z
    .string()
    .optional()
    .transform((s) => (s ? new RegExp(s) : undefined)),
});
export type Condition = z.infer<typeof Condition>;

const Target = z.object({
  conditions: z.array(Condition),
  destination: Destination,
});
export type Target = z.infer<typeof Target>;

export const Config = z.object({
  targets: z.array(Target),
});
export type Config = z.infer<typeof Config>;
