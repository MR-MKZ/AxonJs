import { Request, Response, Headers } from "..";
import { AxonRouteHandler } from "../Router/AxonRouter";

interface Routes {
    [key: string]: AxonRouteHandler
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

export type Controller = (req: Request, res: Response) => Promise<void>

export type Middleware = (req: Request, res: Response, next: nextFn) => Promise<void>;

export type nextFn = () => Promise<void>;

export interface ExceptionMeta {
    type: string;
    description: string;
}

export type RouterExceptionError = {
    msg: string;
    name: string;
    meta: ExceptionMeta
}