import { z } from "zod";

export const ingredientRecentNameSchema = z.string().trim().min(1).max(120);

export const ingredientRecentUpsertSchema = z
  .object({
    ingredients: z.array(ingredientRecentNameSchema).min(1).max(100),
  })
  .strict();

export const ingredientRecentItemSchema = z.object({
  name: z.string().min(1),
  lastUsedAt: z.string().datetime(),
  useCount: z.number().int().positive(),
});

export const ingredientRecentListResponseSchema = z.object({
  ingredients: z.array(ingredientRecentItemSchema),
});

export type IngredientRecentUpsert = z.infer<typeof ingredientRecentUpsertSchema>;
export type IngredientRecentItem = z.infer<typeof ingredientRecentItemSchema>;
export type IngredientRecentListResponse = z.infer<typeof ingredientRecentListResponseSchema>;
