import * as service from '../services/communityService';

export const getSettingsPayment = (req: any, res: any) => service.getSettingsPayment(req, res);
export const postSettingsPayment = (req: any, res: any) => service.postSettingsPayment(req, res);
export const getTournamentsByIdChat = (req: any, res: any) => service.getTournamentsByIdChat(req, res);
export const postTournamentsByIdChat = (req: any, res: any) => service.postTournamentsByIdChat(req, res);
export const putTournamentsByIdRules = (req: any, res: any) => service.putTournamentsByIdRules(req, res);
export const getTournamentsByIdGallery = (req: any, res: any) => service.getTournamentsByIdGallery(req, res);
export const postTournamentsByIdGallery = (req: any, res: any) => service.postTournamentsByIdGallery(req, res);

