import * as service from '../services/auctionService';

export const postTeamsByIdPlayers = (req: any, res: any) => service.postTeamsByIdPlayers(req, res);
export const postPlayers = (req: any, res: any) => service.postPlayers(req, res);
export const putPlayersById = (req: any, res: any) => service.putPlayersById(req, res);
export const deletePlayersById = (req: any, res: any) => service.deletePlayersById(req, res);
export const postAuctionUnsell = (req: any, res: any) => service.postAuctionUnsell(req, res);
export const getTournamentsByIdAuctionPool = (req: any, res: any) => service.getTournamentsByIdAuctionPool(req, res);
export const putTournamentsByIdAuctionPoolReorder = (req: any, res: any) => service.putTournamentsByIdAuctionPoolReorder(req, res);
export const getPlayers = (req: any, res: any) => service.getPlayers(req, res);
export const getTournamentsByIdAuctionInvites = (req: any, res: any) => service.getTournamentsByIdAuctionInvites(req, res);
export const postTournamentsByIdAuctionInvites = (req: any, res: any) => service.postTournamentsByIdAuctionInvites(req, res);
export const deleteAuctionInvitesById = (req: any, res: any) => service.deleteAuctionInvitesById(req, res);
export const getAuctionInviteByCode = (req: any, res: any) => service.getAuctionInviteByCode(req, res);
export const postAuctionInviteRegister = (req: any, res: any) => service.postAuctionInviteRegister(req, res);
export const postAuctionSell = (req: any, res: any) => service.postAuctionSell(req, res);

