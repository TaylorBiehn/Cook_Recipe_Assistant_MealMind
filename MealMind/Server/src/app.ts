import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { favoritesRouter } from "./routes/favorites.js";
import { recipesRouter } from "./routes/recipes.js";
import { usersRouter } from "./routes/users.js";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "512kb" }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/v1/users", usersRouter);
  app.use("/v1/recipes", recipesRouter);
  app.use("/v1/favorites", favoritesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
