import { Router } from "express";
import { suggestRequestSchema } from "../contracts/recipe.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validateBody.js";

const router = Router();

router.post(
  "/suggest",
  validateBody(suggestRequestSchema),
  asyncHandler(async (_req, _res) => {
    throw new HttpError(
      501,
      "NOT_IMPLEMENTED",
      "Recipe suggestions are not wired yet (OpenAI + persistence in later steps).",
    );
  }),
);

export const recipesRouter = router;
