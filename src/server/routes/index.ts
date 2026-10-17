import { registerTournamentsRoutes } from "./tournamentsRoutes";
import { registerAuthRoutes } from "./authRoutes";
import { registerTeamsRoutes } from "./teamsRoutes";
import { registerAuctionRoutes } from "./auctionRoutes";
import { registerMatchesRoutes } from "./matchesRoutes";
import { registerReportingRoutes } from "./reportingRoutes";
import { registerCommerceRoutes } from "./commerceRoutes";
import { registerCommunityRoutes } from "./communityRoutes";

export function registerApiRoutes(app: any) {
  registerTournamentsRoutes(app);
  registerAuthRoutes(app);
  registerTeamsRoutes(app);
  registerAuctionRoutes(app);
  registerMatchesRoutes(app);
  registerReportingRoutes(app);
  registerCommerceRoutes(app);
  registerCommunityRoutes(app);
}
