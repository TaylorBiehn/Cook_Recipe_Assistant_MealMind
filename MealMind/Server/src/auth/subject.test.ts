import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAuthSubjectFromAuthorizationHeader } from "./subject.js";

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function makeBearerWithPayload(payload: Record<string, unknown>): string {
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  return `Bearer ${header}.${body}.`;
}

describe("getAuthSubjectFromAuthorizationHeader", () => {
  it("extracts sub from bearer token payload", () => {
    const header = makeBearerWithPayload({ sub: "user-123" });
    assert.equal(getAuthSubjectFromAuthorizationHeader(header), "user-123");
  });

  it("returns null for invalid or missing bearer headers", () => {
    assert.equal(getAuthSubjectFromAuthorizationHeader(undefined), null);
    assert.equal(getAuthSubjectFromAuthorizationHeader(""), null);
    assert.equal(getAuthSubjectFromAuthorizationHeader("Basic abc"), null);
    assert.equal(getAuthSubjectFromAuthorizationHeader("Bearer invalid-token"), null);
  });
});
