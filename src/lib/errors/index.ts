export class GameError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = "GameError";
  }

  toJSON() {
    return { error: this.code, message: this.message };
  }
}

export class RLSError extends GameError {
  constructor(message = "Row-level security violation") {
    super(message, "RLS_VIOLATION", 403);
    this.name = "RLSError";
  }
}

export class PolicyError extends GameError {
  constructor(message: string, code = "POLICY_VIOLATION") {
    super(message, code, 422);
    this.name = "PolicyError";
  }
}

export class RateLimitError extends GameError {
  constructor(message = "Too many requests") {
    super(message, "RATE_LIMIT", 429);
    this.name = "RateLimitError";
  }
}

export class NotFoundError extends GameError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class AuthError extends GameError {
  constructor(message = "Authentication required") {
    super(message, "AUTH_REQUIRED", 401);
    this.name = "AuthError";
  }
}

export function handleGameError(error: unknown): Response {
  if (error instanceof GameError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }
  console.error("Unhandled error:", error);
  return Response.json({ error: "INTERNAL", message: "Internal server error" }, { status: 500 });
}
