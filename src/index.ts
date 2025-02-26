// Libraries
import * as http from "http";

// Instances
import AxonCore from "./core/AxonCore";
import AxonRouter from "./Router/AxonRouter";
import { logger } from "./core/utils/coreLogger";

// Types
import AxonResponse from "./core/response/AxonResponse";
import type { Controller, Middleware , nextFn, HttpMethods, RouterExceptionError } from "./types/GlobalTypes";
import type { AxonResponseMessage, AxonCorsConfig, AxonHttpsConfig, UnloadRouteParams } from "./types/CoreTypes";
import type { AxonConfig } from "./types/ConfigTypes";
import type { AxonPlugin } from "./types/PluginTypes";

/**
 * Instance of AxonRouter for easier usage
 * @param prefix prefix for all routes in this router
 * @returns {AxonRouter} returns an instance of AxonRouter
 * @example
 * const router = Router(); // without prefix
 * const router2 = Router("/api/v1"); // with prefix
 */
const Router = (prefix?: string): AxonRouter => new AxonRouter(prefix);

/**
 * Instance of AxonCore for easier usage
 * @returns {AxonCore} returns an instance of AxonCore
 */
const Axon = (): AxonCore => new AxonCore();

/**
 * Instance of logger which used in core to use it in your code.
 */
const axonLogger = logger;

declare module 'http' {
  interface IncomingMessage {
    /**
     * the body of request which sent from client
     */
    body?: string | Record<string, string | undefined> | undefined;
    /**
     * incoming request parameters in request path
     * 
     * example: 
     * - route: `/api/v1/user/:id`
     * - path: `/api/v1/user/12`
     * - params: { "id": 12 }
     */
    params: Record<string, string | undefined>;
  }

  interface ServerResponse {
    /**
     * to add http response code for client.
     * @param code http response code
     */
    status: (code: number) => AxonResponse;
  }
}

interface Request extends http.IncomingMessage {}
interface Response extends http.ServerResponse {}
interface Headers extends http.OutgoingHttpHeaders {}

export {
  AxonCore,
  AxonRouter,
  Axon,
  Router,
  AxonConfig,
  AxonResponseMessage,
  AxonCorsConfig,
  AxonHttpsConfig,
  UnloadRouteParams,
  Request,
  Response,
  Headers,
  nextFn,
  AxonPlugin,
  Controller,
  Middleware,
  HttpMethods,
  RouterExceptionError,
  axonLogger
}