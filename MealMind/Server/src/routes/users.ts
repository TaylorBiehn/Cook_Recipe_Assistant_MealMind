import { Router } from "express";
import type { UserProfileUpsert } from "../contracts/user.js";
import { userProfileUpsertSchema } from "../contracts/user.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { validateBody } from "../middleware/validateBody.js";

const router = Router();

router.get(
  "/me",
  asyncHandler(async (_req, _res) => {
    throw new HttpError(404, "USER_NOT_FOUND", "No user profile is stored yet. Complete onboarding or call PUT /v1/users/me.");
  }),
);

/** Validates body against contract; persistence lands in a later step (echo for integration tests). */
router.put(
  "/me",
  validateBody(userProfileUpsertSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as UserProfileUpsert;
    res.status(200).json({
      data: {
        user: {
          id: "0",
          skillLevel: body.skillLevel,
          kitchenComfort: body.kitchenComfort,
          preferences: body.preferences,
          dislikes: body.dislikes,
          countryCode: body.countryCode,
          city: body.city,
          vegetarianFocus: body.vegetarianFocus,
          pescetarianFriendly: body.pescetarianFriendly,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }),
);

export const usersRouter = router;
