export class ConfigurationError extends Error {
  static {
    ConfigurationError.prototype.name = "ConfigurationError";
  }
  constructor(
    public type: "configurationNotFound" | "invalidConfiguration",
    public message: string,
  ) {
    super(message);
  }
}

export class DispatchError extends Error {
  static {
    DispatchError.prototype.name = "DispatchError";
  }
  constructor(type: "destinationNotFound", message: string);
  constructor(type: "dispatchFailed", message: string, destination: string);
  constructor(
    public type: "destinationNotFound" | "dispatchFailed",
    public message: string,
    public destination?: string,
  ) {
    super(message);
  }
}
