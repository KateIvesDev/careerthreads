export class AIUnavailableError extends Error {
  constructor(message = "AI operation unavailable") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export class AIValidationError extends Error {
  constructor(message = "AI output failed validation") {
    super(message);
    this.name = "AIValidationError";
  }
}
