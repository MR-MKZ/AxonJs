import * as http from "http";

interface Route {
    controller: () => Promise<JsonResponse>;
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
    headers?: http.OutgoingHttpHeaders;
    responseCode: number;
    responseMessage?: string;
}

export type CoreReq = {
    http: http.IncomingMessage,
    body: string
}

export type CoreRes = {
    http: http.ServerResponse,
    status: () => void, 
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