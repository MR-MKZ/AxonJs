import { IncomingMessage, ServerResponse } from "http";
import AxonResponse from "../core/response/AxonResponse";
import { AxonRouteHandler } from "../Router/AxonRouter";
import { BaseController } from "../core/classController";
import type {
    ValidationConfig,
    ValidationSchema,
    ValidationTargets
} from "./ValidatorTypes";

/**
 * Incoming request, including some information about the client.
 */
export interface Request<P> extends IncomingMessage {
    method: string;
    path: string;
    params?: P;
    query?: { [key: string]: string | undefined };
    body?: any;
}

/**
 * Server response to the client.
 */
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

/** 
 * `FuncController` type represents a function controller
 * used in routing. It defines a function type that takes two parameters: a `Request`
 * object and a `Response` object, and returns a `Promise<void>` or `void`. This type is
 * commonly used to define the handler functions for different routes in a web application.
 * The `Request` object contains information about the incoming request, such as method,
 * path, params, query, and body. The `Response` object provides methods to send responses
 * back to the client. The `FuncController` type is generic, allowing you to specify the
 * type of parameters (`P`) that the controller function expects.
 */
export type FuncController<P = {}> = (
    request: Request<P>,
    response: Response,
    ...args: any[]
) => Promise<void> | void;
// ! Type of function controller must check and handle another time to find the best way to handle the dependency injection
// ! and also handle some old features like auto type set for Request params. (<P = {}>)

export type ClassController<C extends BaseController, M extends keyof C> = [new (...args: any[]) => C, M];

export type ControllerConstructor<C extends BaseController = BaseController> = new (...args: any[]) => C;

/** 
 * The `MiddlewareStorage` interface is defining a structure for storing middleware information. Here's
 * what each property represents: 
*/
export interface MiddlewareStorage {
    timeout: number;
    middleware: Middleware;
    critical?: boolean;
}

/** The `Middleware` type represents a function that acts as middleware in a
 * web application. Middleware functions have access to the `Request` object, the
 * `Response` object, and a `NextFunc` function. 
*/
export type Middleware<P = {}> = (
    request: Request<P>,
    response: Response,
    next: NextFunc
) => Promise<void> | void;

/**
 * This function calls when process in current middleware is done and you want to pass 
 * the request to the next middleware or controller.
 */
export type NextFunc = () => Promise<void> | void;

export interface Routes<P = {}> {
    [key: string]: Route<P>
}

export interface Route<P = {}> {
    regex: RegExp;
    paramNames: string[];
    handler: AxonRouteHandler<P>;
    handlerDependency: string[];
    handlerDependencyCache: { [key: string]: any };
}

export interface HttpMethods {
    GET: Routes<any>;
    POST: Routes<any>;
    PUT: Routes<any>;
    DELETE: Routes<any>;
    OPTIONS: Routes<any>;
    PATCH: Routes<any>;
}

/**
 * Required object for auto validation process.
 */
export interface ValidationObj {
    /**
     * Validation schema created with Joi, Zod or Yup.
     * 
     * NOTE: Be carefull, query, params and body for validation is always type of object.
     */
    schema: ValidationSchema;

    /**
     * Options of your validation part for this schema. 
     * 
     * To prevent errors while adding options, use 'as <type>' to set type of object.
     * 
     * @example
     * 
     * options: {} as Joi.ValidationOptions
     * options: {} as Yup.ValidateOptions
     * options: {} as z.ParseParams
     */
    options?: ValidationConfig;

    /**
     * Target of your validator middleware.
     * 
     * - body
     * - params (path parameters - /user/12)
     * - query (query parameters - ?limit=12)
     */
    target?: ValidationTargets | "body";
}