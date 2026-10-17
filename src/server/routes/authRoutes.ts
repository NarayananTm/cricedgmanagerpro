import * as controller from "../controllers/authController";
import { validateRequest, catchAsync } from "../middleware/validationMiddleware";

export function registerAuthRoutes(app: any) {
  app.post("/api/auth/register", validateRequest, catchAsync(controller.postAuthRegister));
  app.post("/api/auth/login", validateRequest, catchAsync(controller.postAuthLogin));
}
