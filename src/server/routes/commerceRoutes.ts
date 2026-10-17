import * as controller from "../controllers/commerceController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerCommerceRoutes(app: any) {
  app.get("/api/products", validateRequest, catchAsync(controller.getProducts));
  app.get("/api/products/:id", validateRequest, catchAsync(controller.getProductsById));
  app.post("/api/products", validateRequest, catchAsync(controller.postProducts));
  app.put("/api/products/:id", validateRequest, catchAsync(controller.putProductsById));
  app.delete("/api/products/:id", validateRequest, catchAsync(controller.deleteProductsById));
  app.get("/api/orders", validateRequest, catchAsync(controller.getOrders));
  app.get("/api/orders/:id", validateRequest, catchAsync(controller.getOrdersById));
  app.post("/api/orders", validateRequest, catchAsync(controller.postOrders));
  app.put("/api/orders/:id/status", validateRequest, catchAsync(controller.putOrdersByIdStatus));
  app.get("/api/grounds", validateRequest, catchAsync(controller.getGrounds));
  app.get("/api/grounds/:id", validateRequest, catchAsync(controller.getGroundsById));
  app.post("/api/grounds", validateRequest, catchAsync(controller.postGrounds));
  app.put("/api/grounds/:id", validateRequest, catchAsync(controller.putGroundsById));
  app.delete("/api/grounds/:id", validateRequest, catchAsync(controller.deleteGroundsById));
  app.get("/api/bookings", validateRequest, catchAsync(controller.getBookings));
  app.post("/api/bookings", validateRequest, catchAsync(controller.postBookings));
  app.put("/api/bookings/:id/status", validateRequest, catchAsync(controller.putBookingsByIdStatus));
  app.get("/api/bookings/:id", validateRequest, catchAsync(controller.getBookingsById));
}
