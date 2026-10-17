import * as controller from "../controllers/teamsController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerTeamsRoutes(app: any) {
  app.post("/api/tournaments/:id/teams", validateRequest, catchAsync(controller.postTournamentsByIdTeams));
  app.put("/api/teams/:id", validateRequest, catchAsync(controller.putTeamsById));
  app.delete("/api/teams/:id", validateRequest, catchAsync(controller.deleteTeamsById));
  app.post("/api/tournaments/:id/generate-fixtures", validateRequest, catchAsync(controller.postTournamentsByIdGenerateFixtures));
  app.post("/api/teams/:id/approve", validateRequest, catchAsync(controller.postTeamsByIdApprove));
  app.get("/api/teams", validateRequest, catchAsync(controller.getTeams));
}
