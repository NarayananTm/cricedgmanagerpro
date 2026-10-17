import * as controller from "../controllers/tournamentsController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerTournamentsRoutes(app: any) {
  app.get("/api", validateRequest, catchAsync(controller.getRoot));
  app.get("/api/health", validateRequest, catchAsync(controller.getHealth));
  app.get("/health", validateRequest, catchAsync(controller.getHealthRoot));
  app.get("/api/tournaments", validateRequest, catchAsync(controller.getTournaments));
  app.post("/api/tournaments", validateRequest, catchAsync(controller.postTournaments));
  app.put("/api/tournaments/:id", validateRequest, catchAsync(controller.putTournamentsById));
  app.delete("/api/tournaments/:id", validateRequest, catchAsync(controller.deleteTournamentsById));
  app.get("/api/tournaments/:id", validateRequest, catchAsync(controller.getTournamentsById));
  app.post("/api/tournaments/:id/matches", validateRequest, catchAsync(controller.postTournamentsByIdMatches));
  app.get("/api/tournaments/:id/matches", validateRequest, catchAsync(controller.getTournamentsByIdMatches));
  app.delete("/api/innings/:id/undo", validateRequest, catchAsync(controller.deleteInningsByIdUndo));
}
