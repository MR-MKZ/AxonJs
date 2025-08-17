/**
 * Base controller class for class based controllers in AxonJs
 *
 * @example
 * class AuthController extends BaseController {
 *     async login(req: Request<Params>, res: Response) {
 *         return res.status(200).body({ token });
 *     }
 *
 *     async logout(req: Request<Params>, res: Response) {
 *         return res.status(200).body({ msg: "Logged out"});
 *     }
 * }
 *
 * router.get("/login", [AuthController, "login"]);
 * router.get("/logout", [AuthController, "logout"]);
 *
 */
export abstract class BaseController {
  constructor() {}
}

export * from "./ClassHandler";
export * from "./ControllerRegistry";