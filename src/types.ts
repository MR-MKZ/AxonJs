import { Request, Response, Headers } from ".";

interface Route {
    controller: (req: Request, res: Response) => Promise<JsonResponse>;
    middlewares?: Array<(req: Request, res: Response) => void>;
}

interface Routes {
    [key: string]: Route
}

export type HttpMethods = {
    GET: Routes;
    POST: Routes;
    PUT: Routes;
    DELETE: Routes;
    OPTIONS: Routes;
    PATCH: Routes;
}

export type JsonResponse = {
    body: object;
    headers?: Headers;
    responseCode: number;
    responseMessage?: string;
}

export interface ExceptionMeta {
    type: string;
    description: string;
}

export type RouterExceptionError = {
    msg: string;
    name: string;
    meta: ExceptionMeta
}