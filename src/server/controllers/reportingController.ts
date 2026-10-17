import * as service from '../services/reportingService';

export const getTournamentsByIdExpenses = (req: any, res: any) => service.getTournamentsByIdExpenses(req, res);
export const getTournamentsByIdSponsors = (req: any, res: any) => service.getTournamentsByIdSponsors(req, res);
export const getSponsorsActive = (req: any, res: any) => service.getSponsorsActive(req, res);
export const postTournamentsByIdSponsors = (req: any, res: any) => service.postTournamentsByIdSponsors(req, res);
export const deleteSponsorsById = (req: any, res: any) => service.deleteSponsorsById(req, res);
export const getAdminAnalyticsByTournamentId = (req: any, res: any) => service.getAdminAnalyticsByTournamentId(req, res);
export const getFeaturedProducts = (req: any, res: any) => service.getFeaturedProducts(req, res);
export const getFeaturedGrounds = (req: any, res: any) => service.getFeaturedGrounds(req, res);
export const postTournamentsByIdExpenses = (req: any, res: any) => service.postTournamentsByIdExpenses(req, res);
export const putExpensesById = (req: any, res: any) => service.putExpensesById(req, res);
export const deleteExpensesById = (req: any, res: any) => service.deleteExpensesById(req, res);
export const getTournamentsByIdStats = (req: any, res: any) => service.getTournamentsByIdStats(req, res);

