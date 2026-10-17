import * as service from '../services/commerceService';

export const getProducts = (req: any, res: any) => service.getProducts(req, res);
export const getProductsById = (req: any, res: any) => service.getProductsById(req, res);
export const postProducts = (req: any, res: any) => service.postProducts(req, res);
export const putProductsById = (req: any, res: any) => service.putProductsById(req, res);
export const deleteProductsById = (req: any, res: any) => service.deleteProductsById(req, res);
export const getOrders = (req: any, res: any) => service.getOrders(req, res);
export const getOrdersById = (req: any, res: any) => service.getOrdersById(req, res);
export const postOrders = (req: any, res: any) => service.postOrders(req, res);
export const putOrdersByIdStatus = (req: any, res: any) => service.putOrdersByIdStatus(req, res);
export const getGrounds = (req: any, res: any) => service.getGrounds(req, res);
export const getGroundsById = (req: any, res: any) => service.getGroundsById(req, res);
export const postGrounds = (req: any, res: any) => service.postGrounds(req, res);
export const putGroundsById = (req: any, res: any) => service.putGroundsById(req, res);
export const deleteGroundsById = (req: any, res: any) => service.deleteGroundsById(req, res);
export const getBookings = (req: any, res: any) => service.getBookings(req, res);
export const postBookings = (req: any, res: any) => service.postBookings(req, res);
export const putBookingsByIdStatus = (req: any, res: any) => service.putBookingsByIdStatus(req, res);
export const getBookingsById = (req: any, res: any) => service.getBookingsById(req, res);

