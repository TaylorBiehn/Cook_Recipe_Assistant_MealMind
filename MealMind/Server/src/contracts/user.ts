import { z } from "zod";
import { kitchenComfortSchema, skillLevelSchema } from "./recipe.js";

/**
 * `PUT /v1/users/me` — camelCase JSON.
 * - **Onboarding** sends: country, city, skillLevel, kitchenComfort, preferences, dislikes (no dietary flags required).
 * - **Profile** adds/overrides: vegetarianFocus, pescetarianFriendly (default false when omitted).
 */
export const userProfileUpsertSchema = z
  .object({
    skillLevel: skillLevelSchema,
    kitchenComfort: kitchenComfortSchema,
    preferences: z.array(z.string().min(1)),
    dislikes: z.array(z.string().min(1)),
    countryCode: z.string().min(1).max(32).optional(),
    city: z.string().max(128).optional(),
    vegetarianFocus: z.boolean().optional(),
    pescetarianFriendly: z.boolean().optional(),
  })
  .strict()
  .transform((body) => ({
    ...body,
    countryCode: (body.countryCode ?? "WORLDWIDE").toUpperCase(),
    city: body.city?.trim() ? body.city.trim() : "",
    vegetarianFocus: body.vegetarianFocus ?? false,
    pescetarianFriendly: body.pescetarianFriendly ?? false,
  }));

export const userProfileResponseSchema = z.object({
  id: z.string().regex(/^\d+$/),
  skillLevel: skillLevelSchema,
  kitchenComfort: kitchenComfortSchema,
  preferences: z.array(z.string().min(1)),
  dislikes: z.array(z.string().min(1)),
  countryCode: z.string().min(1).max(32),
  city: z.string(),
  vegetarianFocus: z.boolean(),
  pescetarianFriendly: z.boolean(),
  updatedAt: z.string().datetime(),
});

export type UserProfileUpsert = z.infer<typeof userProfileUpsertSchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
