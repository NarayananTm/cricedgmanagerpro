import * as controller from "../controllers/matchesController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerMatchesRoutes(app: any) {
  app.post("/api/matches/:id/start", validateRequest, catchAsync(controller.postMatchesByIdStart));
  app.post("/api/matches/:id/end", validateRequest, catchAsync(controller.postMatchesByIdEnd));
  app.get("/api/matches/live", validateRequest, catchAsync(controller.getMatchesLive));
  app.get("/api/matches", validateRequest, catchAsync(controller.getMatches));
  app.post("/api/matches", validateRequest, catchAsync(controller.postMatches));
  app.post("/api/matches/:id/quick-score", validateRequest, catchAsync(controller.postMatchesByIdQuickScore));
  app.put("/api/matches/:id", validateRequest, catchAsync(controller.putMatchesById));
  app.delete("/api/matches/:id", validateRequest, catchAsync(controller.deleteMatchesById));
  app.post("/api/matches/:id/score", validateRequest, catchAsync(controller.postMatchesByIdScore));
  app.post("/api/matches/:id/score-generic", validateRequest, catchAsync(controller.postMatchesByIdScoreGeneric));
  app.put("/api/matches/:id/settings", validateRequest, catchAsync(controller.putMatchesByIdSettings));
  app.post("/api/matches/:id/events", validateRequest, catchAsync(controller.postMatchesByIdEvents));
  app.get("/api/matches/:id/events", validateRequest, catchAsync(controller.getMatchesByIdEvents));
}
