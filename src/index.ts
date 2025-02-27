// Libraries
import * as http from "http";

// Instances
import AxonCore from "./core/AxonCore";
import AxonRouter from "./Router/AxonRouter";

// Types
import AxonResponse from "./core/response/AxonResponse";
import type { Controller, Middleware , nextFn} from "./types/GlobalTypes";
import type { AxonResponseMessage, AxonCorsConfig, AxonHttpsConfig, UnloadRouteParams } from "./types/CoreTypes";
import type { AxonConfig } from "./types/ConfigTypes";
import type { AxonPlugin } from "./types/PluginTypes";

/**
 * Instance of AxonRouter for easier usage
 * @returns {AxonRouter} returns an instance of AxonRouter
 */
const Router = (): AxonRouter => new AxonRouter();

/**
 * Instance of AxonCore for easier usage
 * @returns {AxonCore} returns an instance of AxonCore
 */
const Axon = (): AxonCore => new AxonCore();

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
  Middleware
}