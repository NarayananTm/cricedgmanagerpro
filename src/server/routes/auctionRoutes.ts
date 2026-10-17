import * as controller from "../controllers/auctionController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerAuctionRoutes(app: any) {
  app.post("/api/teams/:id/players", validateRequest, catchAsync(controller.postTeamsByIdPlayers));
  app.post("/api/players", validateRequest, catchAsync(controller.postPlayers));
  app.put("/api/players/:id", validateRequest, catchAsync(controller.putPlayersById));
  app.delete("/api/players/:id", validateRequest, catchAsync(controller.deletePlayersById));
  app.post("/api/auction/unsell", validateRequest, catchAsync(controller.postAuctionUnsell));
  app.get("/api/tournaments/:id/auction/pool", validateRequest, catchAsync(controller.getTournamentsByIdAuctionPool));
  app.put("/api/tournaments/:id/auction/pool/reorder", validateRequest, catchAsync(controller.putTournamentsByIdAuctionPoolReorder));
  app.get("/api/players", validateRequest, catchAsync(controller.getPlayers));
  app.get("/api/tournaments/:id/auction/invites", validateRequest, catchAsync(controller.getTournamentsByIdAuctionInvites));
  app.post("/api/tournaments/:id/auction/invites", validateRequest, catchAsync(controller.postTournamentsByIdAuctionInvites));
  app.delete("/api/auction/invites/:id", validateRequest, catchAsync(controller.deleteAuctionInvitesById));
  app.get("/api/auction/invite/:code", validateRequest, catchAsync(controller.getAuctionInviteByCode));
  app.post("/api/auction/invite/register", validateRequest, catchAsync(controller.postAuctionInviteRegister));
  app.post("/api/auction/sell", validateRequest, catchAsync(controller.postAuctionSell));
}
