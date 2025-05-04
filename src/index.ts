// Libraries
import * as http from "http";

// Instances
import AxonCore from "./core/AxonCore";
import AxonRouter from "./Router/AxonRouter";
import { logger } from "./core/utils/coreLogger";

// Types
import type { RouterExceptionError } from "./types/GlobalTypes";
import type { AxonResponseMessage, AxonCorsConfig, AxonHttpsConfig, UnloadRouteParams } from "./types/CoreTypes";
import type { Request, Response, Middleware, NextFunc, FuncController, HttpMethods } from "./types/RouterTypes";
import type { AxonConfig } from "./types/ConfigTypes";
import type { AxonPlugin, PluginMode } from "./types/PluginTypes";

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

interface Headers extends http.OutgoingHttpHeaders { }

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
  NextFunc,
  AxonPlugin,
  PluginMode,
  FuncController,
  Middleware,
  HttpMethods,
  RouterExceptionError,
  axonLogger
}