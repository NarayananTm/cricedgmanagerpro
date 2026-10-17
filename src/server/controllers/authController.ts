import * as service from '../services/authService';

export const postAuthRegister = (req: any, res: any) => service.postAuthRegister(req, res);
export const postAuthLogin = (req: any, res: any) => service.postAuthLogin(req, res);

