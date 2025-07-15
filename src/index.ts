// Libraries
import * as http from "http";

// Instances
import AxonCore from "./core/AxonCore";
import AxonRouter from "./Router/AxonRouter";
import { logger } from "./core/utils/coreLogger";
import AxonCookie from "./core/cookie/AxonCookie";
import { BaseController } from "./core/classController";
import { NeuronContainer } from "./core/DI";

// Types
import type { RouterExceptionError } from "./types/GlobalTypes";
import type {
  AxonResponseMessage,
  AxonCorsConfig,
  AxonHttpsConfig,
  UnloadRouteParams
} from "./types/CoreTypes";
import type {
  Request,
  Response,
  Middleware,
  NextFunc,
  FuncController,
  HttpMethods,
  ValidationObj
} from "./types/RouterTypes";
import type { AxonConfig } from "./types/ConfigTypes";
import type { AxonPlugin, PluginMode } from "./types/PluginTypes";
import type {
  ValidationConfig,
  ValidationSchema,
  ValidationTargets
} from "./types/ValidatorTypes";
import type { CookieOptions } from "./types/CookieTypes";
import type { Lifecycle } from "./types/Dependency";

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
 * @param {AxonConfig} config Hardcoded core config
 * @returns {AxonCore} returns an instance of AxonCore
 */
const Axon = (config?: AxonConfig): AxonCore => new AxonCore(config);

/**
 * Pino logger instance used in Axon core and exposed for external use.
 */
const axonLogger = logger;

// interface Headers extends http.OutgoingHttpHeaders { }
type Headers = http.OutgoingHttpHeaders;

export {
  // Cores - Router and Main core
  AxonCore,
  AxonRouter,

  // Core instance generators
  Axon,
  Router,

  // Request life cycle
  Headers,

  // Handlers
  BaseController,

  // Pino logger - Logger feature
  axonLogger,

  // Axon Cookie Manager
  AxonCookie,

  // Neuron Container (Axon Dependency Injection System)
  NeuronContainer,
}

export type {
  // Errors 
  RouterExceptionError,

  // Configs - configuration feature
  AxonResponseMessage,
  AxonCorsConfig,
  AxonHttpsConfig,

  // Main core
  UnloadRouteParams,

  // Request life cycle
  Request,
  Response,
  NextFunc,

  // Handlers
  Middleware,
  FuncController,

  // Router
  HttpMethods,
  ValidationObj,

  // Core config
  AxonConfig,

  // Plugin
  AxonPlugin,
  PluginMode,

  // Axon Validator - Validation feature
  ValidationConfig,
  ValidationSchema,
  ValidationTargets,

  // Axon Cookie Manager
  CookieOptions,

  // Neuron Container (Axon Dependency Injection System)
  Lifecycle,
}