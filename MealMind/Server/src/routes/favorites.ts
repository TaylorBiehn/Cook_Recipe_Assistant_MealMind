import { Router } from "express";
import { favoriteCreateSchema } from "../contracts/favorite.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validateBody.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.status(200).json({ data: { favorites: [] } });
  }),
);

router.post(
  "/",
  validateBody(favoriteCreateSchema),
  asyncHandler(async (_req, _res) => {
    throw new HttpError(501, "NOT_IMPLEMENTED", "Saving favorites requires MySQL wiring in a later step.");
  }),
);

router.delete(
  "/:favoriteId",
  asyncHandler(async (_req, _res) => {
    throw new HttpError(501, "NOT_IMPLEMENTED", "Deleting favorites requires MySQL wiring in a later step.");
  }),
);

export const favoritesRouter = router;
