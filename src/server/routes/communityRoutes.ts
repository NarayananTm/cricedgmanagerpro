import * as controller from "../controllers/communityController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerCommunityRoutes(app: any) {
  app.get("/api/settings/payment", validateRequest, catchAsync(controller.getSettingsPayment));
  app.post("/api/settings/payment", validateRequest, catchAsync(controller.postSettingsPayment));
  app.get("/api/tournaments/:id/chat", validateRequest, catchAsync(controller.getTournamentsByIdChat));
  app.post("/api/tournaments/:id/chat", validateRequest, catchAsync(controller.postTournamentsByIdChat));
  app.put("/api/tournaments/:id/rules", validateRequest, catchAsync(controller.putTournamentsByIdRules));
  app.get("/api/tournaments/:id/gallery", validateRequest, catchAsync(controller.getTournamentsByIdGallery));
  app.post("/api/tournaments/:id/gallery", validateRequest, catchAsync(controller.postTournamentsByIdGallery));
}
