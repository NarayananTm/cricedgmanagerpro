import * as controller from "../controllers/reportingController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerReportingRoutes(app: any) {
  app.get("/api/tournaments/:id/expenses", validateRequest, catchAsync(controller.getTournamentsByIdExpenses));
  app.get("/api/tournaments/:id/sponsors", validateRequest, catchAsync(controller.getTournamentsByIdSponsors));
  app.get("/api/sponsors/active", validateRequest, catchAsync(controller.getSponsorsActive));
  app.post("/api/tournaments/:id/sponsors", validateRequest, catchAsync(controller.postTournamentsByIdSponsors));
  app.delete("/api/sponsors/:id", validateRequest, catchAsync(controller.deleteSponsorsById));
  app.get("/api/admin/analytics/:tournamentId", validateRequest, catchAsync(controller.getAdminAnalyticsByTournamentId));
  app.get("/api/featured/products", validateRequest, catchAsync(controller.getFeaturedProducts));
  app.get("/api/featured/grounds", validateRequest, catchAsync(controller.getFeaturedGrounds));
  app.post("/api/tournaments/:id/expenses", validateRequest, catchAsync(controller.postTournamentsByIdExpenses));
  app.put("/api/expenses/:id", validateRequest, catchAsync(controller.putExpensesById));
  app.delete("/api/expenses/:id", validateRequest, catchAsync(controller.deleteExpensesById));
  app.get("/api/tournaments/:id/stats", validateRequest, catchAsync(controller.getTournamentsByIdStats));
}
