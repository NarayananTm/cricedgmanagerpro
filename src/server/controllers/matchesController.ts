import * as service from '../services/matchesService';

export const postMatchesByIdStart = (req: any, res: any) => service.postMatchesByIdStart(req, res);
export const postMatchesByIdEnd = (req: any, res: any) => service.postMatchesByIdEnd(req, res);
export const getMatchesLive = (req: any, res: any) => service.getMatchesLive(req, res);
export const getMatches = (req: any, res: any) => service.getMatches(req, res);
export const postMatches = (req: any, res: any) => service.postMatches(req, res);
export const postMatchesByIdQuickScore = (req: any, res: any) => service.postMatchesByIdQuickScore(req, res);
export const putMatchesById = (req: any, res: any) => service.putMatchesById(req, res);
export const deleteMatchesById = (req: any, res: any) => service.deleteMatchesById(req, res);
export const postMatchesByIdScore = (req: any, res: any) => service.postMatchesByIdScore(req, res);
export const postMatchesByIdScoreGeneric = (req: any, res: any) => service.postMatchesByIdScoreGeneric(req, res);
export const putMatchesByIdSettings = (req: any, res: any) => service.putMatchesByIdSettings(req, res);
export const postMatchesByIdEvents = (req: any, res: any) => service.postMatchesByIdEvents(req, res);
export const getMatchesByIdEvents = (req: any, res: any) => service.getMatchesByIdEvents(req, res);

