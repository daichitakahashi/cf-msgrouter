import { describe, expect, test } from "vitest";

import { findRoute } from "./router";
import type { Config } from "./schema";

test("empty conditions", () => {
  const config: Config = {
    targets: [
      {
        conditions: [],
        destination: {
          type: "queue",
          queue: "FOO",
        },
      },
    ],
  };

  const result = findRoute(config, {
    key: "foo",
  });

  expect(result).toStrictEqual({
    type: "queue",
    queue: "FOO",
  });
});

test("empty targets", () => {
  const config: Config = {
    targets: [],
  };

  const result = findRoute(config, {
    key: "foo",
  });

  expect(result).toBeNull();
});

describe("path", () => {
  test("match existing path", () => {
    const config: Config = {
      targets: [
        {
          conditions: [
            {
              path: "$.key",
            },
          ],
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
          conditions: [
            {
              path: "$.unknown",
            },
          ],
          destination: {
            type: "queue",
            queue: "DEFAULT",
          },
        },
      ],
    };

    const result = findRoute(config, {
      key: "foo",
    });

    expect(result).toBeNull();
  });
});

describe("exact", () => {
  test("match string", () => {
    const config: Config = {
      targets: [
        {
          conditions: [
            {
              path: "$.key",
              exact: "foo",
            },
          ],
          destination: {
            type: "queue",
            queue: "FOO",
          },
        },
        {
          conditions: [
            {
              path: "$.key",
              exact: "bar",
            },
          ],
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

  test("match number", () => {
    const config: Config = {
      targets: [
        {
          conditions: [
            {
              path: "$.level",
              exact: 5,
            },
          ],
          destination: {
            type: "queue",
            queue: "LEVEL_FIVE",
          },
        },
        {
          conditions: [
            {
              path: "$.level",
              exact: 10,
            },
          ],
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

  test("match null", () => {
    const config: Config = {
      targets: [
        {
          conditions: [
            {
              path: "$.option",
              exact: null,
            },
          ],
          destination: {
            type: "queue",
            queue: "OPTION_NULL",
          },
        },
        {
          conditions: [
            {
              path: "$.option",
            },
          ],
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
});

describe("match", () => {
  test("match prefix", () => {
    const config: Config = {
      targets: [
        {
          conditions: [
            {
              path: "$.key",
              match: /^group01-/,
            },
          ],
          destination: {
            type: "queue",
            queue: "GROUP_01",
          },
        },
        {
          conditions: [
            {
              path: "$.key",
              match: /^group02-/,
            },
          ],
          destination: {
            type: "queue",
            queue: "GROUP_02",
          },
        },
      ],
    };

    const result = findRoute(config, {
      key: "group02-foo",
    });

    expect(result).toStrictEqual({
      type: "queue",
      queue: "GROUP_02",
    });
  });

  test("doesn't match number", () => {
    const config: Config = {
      targets: [
        {
          conditions: [
            {
              path: "$.key",
              match: /0/,
            },
          ],
          destination: {
            type: "queue",
            queue: "ZERO",
          },
        },
      ],
    };

    const result = findRoute(config, {
      key: 0,
    });

    expect(result).toBeNull();
  });
});

describe("multiple matcher", () => {
  test("match prefix", () => {
    const config: Config = {
      targets: [
        {
          conditions: [
            {
              path: "$.key",
              match: /^foo-/,
            },
            {
              path: "$.enabled",
              exact: true,
            },
          ],
          destination: {
            type: "queue",
            queue: "MULTIPLE",
          },
        },
      ],
    };

    const result = findRoute(config, {
      key: "foo-bar",
      enabled: true,
    });

    expect(result).toStrictEqual({
      type: "queue",
      queue: "MULTIPLE",
    });
  });
});
