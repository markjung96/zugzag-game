import { describe, it, expect } from "vitest";
import {
  GameError,
  RLSError,
  PolicyError,
  NotFoundError,
  AuthError,
  RateLimitError,
  handleGameError,
} from "@/lib/errors";

describe("GameError hierarchy", () => {
  it("GameError carries code and statusCode", () => {
    const err = new GameError("test", "TEST_ERR", 400);
    expect(err.code).toBe("TEST_ERR");
    expect(err.statusCode).toBe(400);
    expect(err.toJSON()).toEqual({ error: "TEST_ERR", message: "test" });
  });

  it("RLSError defaults to 403", () => {
    const err = new RLSError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("RLS_VIOLATION");
  });

  it("PolicyError defaults to 422", () => {
    const err = new PolicyError("invalid");
    expect(err.statusCode).toBe(422);
  });

  it("NotFoundError defaults to 404", () => {
    const err = new NotFoundError("Season");
    expect(err.message).toBe("Season not found");
  });

  it("AuthError defaults to 401", () => {
    expect(new AuthError().statusCode).toBe(401);
  });

  it("RateLimitError defaults to 429", () => {
    expect(new RateLimitError().statusCode).toBe(429);
  });

  it("handleGameError returns proper Response for GameError", async () => {
    const res = handleGameError(new NotFoundError("Send"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("NOT_FOUND");
  });

  it("handleGameError returns 500 for unknown errors", async () => {
    const res = handleGameError(new Error("boom"));
    expect(res.status).toBe(500);
  });
});
