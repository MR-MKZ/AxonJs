import { BaseController } from '../../../src';
import type { Response, Request } from '../../../src';

class AuthController extends BaseController {
  async login(req: Request<any>, res: Response) {
    res.status(200).body({
      msg: 'Axon Class-based Controller 🤙',
    });
  }
}

export default AuthController;
