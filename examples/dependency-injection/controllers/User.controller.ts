import { BaseController } from '../../../src';
import type { Response, Request } from '../../../src';
import { MainDB } from '../main';

class UserController extends BaseController {
  // * You can inject your dependency as third arguments in an object and core will detect and injdect it automatically
  // ! (types are not important)
  async get(req: Request<any>, res: Response, { MainDB }: { MainDB: MainDB }) {
    await MainDB.getUser(12);
  }

  async find(
    req: Request<any>,
    res: Response,
    { userQuery }: { userQuery: (...args: any[]) => any }
  ) {
    userQuery();
  }
}

export default UserController;
