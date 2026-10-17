import * as service from '../services/teamsService';

export const postTournamentsByIdTeams = (req: any, res: any) => service.postTournamentsByIdTeams(req, res);
export const putTeamsById = (req: any, res: any) => service.putTeamsById(req, res);
export const deleteTeamsById = (req: any, res: any) => service.deleteTeamsById(req, res);
export const postTournamentsByIdGenerateFixtures = (req: any, res: any) => service.postTournamentsByIdGenerateFixtures(req, res);
export const postTeamsByIdApprove = (req: any, res: any) => service.postTeamsByIdApprove(req, res);
export const getTeams = (req: any, res: any) => service.getTeams(req, res);

