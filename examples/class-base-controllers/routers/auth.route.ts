import { Router } from "../../../src";
import AuthController from "../controllers/auth.controller";

const router = Router("/api/auth");

router.post("/login", [AuthController, "login"]);

export default router;