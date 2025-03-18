import { IncomingMessage, ServerResponse } from "http";
import AxonResponse from "../core/response/AxonResponse";
import { AxonRouteHandler } from "../Router/AxonRouter";

export interface Request<P> extends IncomingMessage {
    method: string;
    path: string;
    params?: P;
    query?: { [key: string]: string | undefined };
    body?: any;
}

export interface Response extends ServerResponse {
    status: (code: number) => AxonResponse;
}

/**
 * Utility type that extracts dynamic parameter keys from a route string.
 *
 * Example:
 *  - "/users/{id}(\\d+)" becomes { id: string }
 *  - "/posts/{postId}/comments/{commentId}" becomes { postId: string; commentId: string }
 */
export type RouteParams<Path extends string> =
    Path extends `${infer _Start}{${infer Param}}${infer Rest}`
    ? { [K in Param | keyof RouteParams<Rest>]: string }
    : {};

export type FuncController<P = {}> = (
    request: Request<P>,
    response: Response
) => Promise<void> | void;

// Controller will be type of class base controllers.

export type Middleware<P = {}> = (
    request: Request<P>,
    response: Response,
    next: NextFunc
) => Promise<void> | void;

export type NextFunc = () => Promise<void> | void;

export interface Routes<P = {}> {
    [key: string]: Route<P>
}

export interface Route<P = {}> {
    regex: RegExp;
    paramNames: string[];
    handler: AxonRouteHandler<P>;
}

export interface HttpMethods {
    GET: Routes<any>;
    POST: Routes<any>;
    PUT: Routes<any>;
    DELETE: Routes<any>;
    OPTIONS: Routes<any>;
    PATCH: Routes<any>;
}