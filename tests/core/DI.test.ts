import { Axon, BaseController, Router } from '../../src';
import type { Request, Response } from '../../src';
import * as http from 'http';
import { makeRequest } from '../utils';

type Func = (...args: any[]) => any;

interface IFunctionArgs {
    funcDep: Func
}

interface IClassArgs {
    classDep: ClassDependency
    class2Dep: ClassDependency
}

const functionDependency = async () => {
    return {
        msg: "Function dependency injected successfully"
    }
}

class ClassDependency {
    async get() {
        return {
            msg: "Class dependency injected successfully"
        }
    }
}

class SimpleController extends BaseController {
    async funcDI(req: Request<any>, res: Response, { funcDep }: IFunctionArgs) {
        const response = await funcDep();
        return res.status(200).body(response);
    }

    async classDI(req: Request<any>, res: Response, { classDep }: IClassArgs) {
        const response = await classDep.get();
        return res.status(200).body(response);
    }
}

describe('Dependency Injection tests', () => {
    const core = Axon();
    const router = Router();
    const TEST_PORT = 19878; // Use a high port number to avoid conflicts  
    const TEST_HOST = '127.0.0.1';
    const userOptions: http.RequestOptions = {
        hostname: TEST_HOST,
        port: TEST_PORT
    }

    beforeAll(async () => {
        router.get("/class/funcDI", [SimpleController, "funcDI"]);
        router.get("/class/classDI", [SimpleController, "classDI"]);

        router.get("/function/funcDI", async (req, res, { funcDep }: IFunctionArgs) => {
            const response = await funcDep();
            return res.status(200).body(response);
        });

        router.get("/function/classDI", async (req, res, { classDep }: IClassArgs) => {
            const response = await classDep.get();
            return res.status(200).body(response);
        });

        router.get("/function/objDI", async (req, res, { class2Dep }: IClassArgs) => {
            const response = await class2Dep.get();
            return res.status(200).body(response);
        })

        router.get("/unknown/deps", async (req, res) => {
            return res.status(200).body({});
        });

        await core.loadRoute(router);

        await core.registerDependency("classDep", new ClassDependency());
        await core.registerDependency("funcDep", functionDependency);
        await core.registerDependency("class2Dep", ClassDependency);

        return new Promise((resolve) => {
            core.listen(TEST_HOST, TEST_PORT, () => {
                resolve(true);
            })
        });
    });

    afterAll(() => {
        core.close();
    });

    test("Should class base controller access to function dependency in method layer", async () => {
        const response = await makeRequest({ path: "/class/funcDI", userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            msg: "Function dependency injected successfully"
        });
    });

    test("Should class base controller access to class dependency in method layer", async () => {
        const response = await makeRequest({ path: "/class/classDI", userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            msg: "Class dependency injected successfully"
        });
    });

    test("Should function controller access to function dependency", async () => {
        const response = await makeRequest({ path: "/function/funcDI", userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            msg: 'Function dependency injected successfully'
        });
    });

    test("Should function controller access to class dependency", async () => {
        const response = await makeRequest({ path: "/function/classDI", userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            msg: 'Class dependency injected successfully'
        });
    });

    test("Should class dependency instance pass to controller when just object passed", async () => {
        const response = await makeRequest({ path: "/function/objDI", userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            msg: 'Class dependency injected successfully'
        });
    });

    test("Should controller have no dependency", async () => {
        const response = await makeRequest({ path: "/unknown/deps", userOptions });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({});
    });
});