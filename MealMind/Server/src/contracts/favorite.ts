import { z } from "zod";
import { recipeStoredSchema } from "./recipe.js";

export const favoriteCreateSchema = z
  .object({
    recipeData: recipeStoredSchema,
  })
  .strict();

export const favoriteListItemSchema = z.object({
  id: z.string().regex(/^\d+$/),
  recipeData: recipeStoredSchema,
  createdAt: z.string().datetime(),
});

export const favoriteListResponseSchema = z.object({
  favorites: z.array(favoriteListItemSchema),
});

export type FavoriteCreate = z.infer<typeof favoriteCreateSchema>;
export type FavoriteListItem = z.infer<typeof favoriteListItemSchema>;
export type FavoriteListResponse = z.infer<typeof favoriteListResponseSchema>;
