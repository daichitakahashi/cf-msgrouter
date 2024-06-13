import { describe, expect, test } from "vitest";

import type { Config } from "./schema";
import { findRoute } from "./router";

describe("findRoute", () => {
  test("exact match(string)", () => {
    const config: Config = {
      targets: [
        {
          path: "$.key",
          exact: "foo",
          destination: {
            type: "queue",
            queue: "FOO",
          },
        },
        {
          path: "$.key",
          exact: "bar",
          destination: {
            type: "queue",
            queue: "BAR",
          },
        },
      ],
    };

    const result = findRoute(config, {
      key: "bar",
    });

    expect(result).toStrictEqual({
      type: "queue",
      queue: "BAR",
    });
  });

  test("exact match(number)", () => {
    const config: Config = {
      targets: [
        {
          path: "$.level",
          exact: 5,
          destination: {
            type: "queue",
            queue: "LEVEL_FIVE",
          },
        },
        {
          path: "$.level",
          exact: 10,
          destination: {
            type: "queue",
            queue: "LEVEL_TEN",
          },
        },
      ],
    };

    const result = findRoute(config, {
      level: 10,
    });

    expect(result).toStrictEqual({
      type: "queue",
      queue: "LEVEL_TEN",
    });
  });

  test("exact match(null)", () => {
    const config: Config = {
      targets: [
        {
          path: "$.option",
          exact: null,
          destination: {
            type: "queue",
            queue: "OPTION_NULL",
          },
        },
        {
          path: "$.option",
          destination: {
            type: "queue",
            queue: "OPTION_DEFAULT",
          },
        },
      ],
    };

    const result = findRoute(config, {
      option: null,
    });

    expect(result).toStrictEqual({
      type: "queue",
      queue: "OPTION_NULL",
    });
  });

  test("match existing path", () => {
    const config: Config = {
      targets: [
        {
          path: "$.key",
          destination: {
            type: "queue",
            queue: "DEFAULT",
          },
        },
      ],
    };

    const result = findRoute(config, {
      key: "unknown",
    });

    expect(result).toStrictEqual({
      type: "queue",
      queue: "DEFAULT",
    });
  });

  test("unknown path", () => {
    const config: Config = {
      targets: [
        {
          path: "$.key",
          destination: {
            type: "queue",
            queue: "DEFAULT",
          },
        },
      ],
    };

    const result = findRoute(config, {
      invalid: "unknown",
    });

    expect(result).toBeNull();
  });
});
