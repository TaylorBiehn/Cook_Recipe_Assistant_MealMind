import { z } from "zod";

/** Kitchen skill (onboarding + profile). */
export const skillLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

/** Alias for recipe difficulty / legacy naming in some payloads. */
export const cookingLevelSchema = skillLevelSchema;

/** Typical cooking effort (user “cooking level” in product copy). */
export const kitchenComfortSchema = z.enum(["quick_simple", "balanced", "ambitious"]);

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snacks"]);

export const cookingStyleSchema = z.enum([
  "quick_meals",
  "family_meals",
  "budget_friendly",
  "healthy",
]);

export const recipeDifficultySchema = z.enum(["easy", "medium", "hard"]);

export const recipeIngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.string().optional(),
});

export const recipeStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string().optional(),
  instruction: z.string().min(1),
  sourceUrl: z.string().url().optional(),
});

/** One recipe returned from suggest (validated strictly). */
export const recipeDetailSchema = z
  .object({
    slug: z.string().min(1).optional(),
    title: z.string().min(1),
    cookingTime: z.number().int().nonnegative().describe("Total time in minutes (PRD: cooking time)"),
    difficulty: recipeDifficultySchema,
    summary: z.string(),
    ingredients: z.array(recipeIngredientSchema),
    steps: z.array(recipeStepSchema),
    tips: z.string().optional(),
    isBestChoice: z.boolean(),
    sourceUrls: z.array(z.string().url()),
    videoUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
  })
  .strict();

/** Saved favorites may include extra legacy keys from older clients. */
export const recipeStoredSchema = recipeDetailSchema.passthrough();

export const suggestRequestSchema = z
  .object({
    ingredientsText: z.string(),
    ingredientTags: z.array(z.string().min(1)).optional(),
    maxCookMinutes: z.number().int().positive().max(24 * 60).optional(),
    mealType: mealTypeSchema.optional(),
    cookingStyle: cookingStyleSchema.optional(),
  })
  .strict();

export const suggestResponseSchema = z
  .object({
    recipes: z.array(recipeDetailSchema).min(2).max(3),
  })
  .strict()
  .superRefine((val, ctx) => {
    const winners = val.recipes.filter((r) => r.isBestChoice);
    if (winners.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one recipe must have isBestChoice: true",
        path: ["recipes"],
      });
    }
  });

export type CookingLevel = z.infer<typeof cookingLevelSchema>;
export type MealType = z.infer<typeof mealTypeSchema>;
export type CookingStyle = z.infer<typeof cookingStyleSchema>;
export type RecipeDifficulty = z.infer<typeof recipeDifficultySchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeStep = z.infer<typeof recipeStepSchema>;
export type RecipeDetail = z.infer<typeof recipeDetailSchema>;
export type RecipeStored = z.infer<typeof recipeStoredSchema>;
export type SuggestRequest = z.infer<typeof suggestRequestSchema>;
export type SuggestResponse = z.infer<typeof suggestResponseSchema>;
