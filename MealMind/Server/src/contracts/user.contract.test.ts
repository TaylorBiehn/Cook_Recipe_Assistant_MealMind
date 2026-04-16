import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userProfileUpsertSchema } from "./user.js";

describe("userProfileUpsertSchema", () => {
  it("defaults countryCode to WORLDWIDE when omitted", () => {
    const r = userProfileUpsertSchema.parse({
      skillLevel: "beginner",
      kitchenComfort: "balanced",
      preferences: [],
      dislikes: [],
    });
    assert.equal(r.countryCode, "WORLDWIDE");
    assert.equal(r.city, "");
    assert.equal(r.vegetarianFocus, false);
    assert.equal(r.pescetarianFriendly, false);
  });

  it("uppercases countryCode and trims city", () => {
    const r = userProfileUpsertSchema.parse({
      skillLevel: "intermediate",
      kitchenComfort: "quick_simple",
      preferences: ["spicy"],
      dislikes: [],
      countryCode: "jp",
      city: "  Osaka  ",
      vegetarianFocus: true,
    });
    assert.equal(r.countryCode, "JP");
    assert.equal(r.city, "Osaka");
  });
});
