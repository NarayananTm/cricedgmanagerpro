import * as service from '../services/tournamentsService';

export const getRoot = (req: any, res: any) => service.getRoot(req, res);
export const getHealth = (req: any, res: any) => service.getHealth(req, res);
export const getHealthRoot = (req: any, res: any) => service.getHealthRoot(req, res);
export const getTournaments = (req: any, res: any) => service.getTournaments(req, res);
export const postTournaments = (req: any, res: any) => service.postTournaments(req, res);
export const putTournamentsById = (req: any, res: any) => service.putTournamentsById(req, res);
export const deleteTournamentsById = (req: any, res: any) => service.deleteTournamentsById(req, res);
export const getTournamentsById = (req: any, res: any) => service.getTournamentsById(req, res);
export const postTournamentsByIdMatches = (req: any, res: any) => service.postTournamentsByIdMatches(req, res);
export const getTournamentsByIdMatches = (req: any, res: any) => service.getTournamentsByIdMatches(req, res);
export const deleteInningsByIdUndo = (req: any, res: any) => service.deleteInningsByIdUndo(req, res);


