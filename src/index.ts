// Libraries
import * as http from 'http';

// Instances
import AxonCore from './core/AxonCore';
import AxonRouter from './Router/AxonRouter';
import { logger } from './core/utils/coreLogger';
import { AxonCookie } from './modules/Cookie';
import { BaseController } from './modules/ClassController';
import { NeuronContainer } from './modules/DI';

// Types
import type { AxonConfig } from './types/ConfigTypes';

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
};

export type { RouterExceptionError } from './types/GlobalTypes';

export type {
  // Configs - configuration feature
  AxonResponseMessage,
  CorsOptions,
  AxonHttpsConfig,

  // Main core
  UnloadRouteParams,
} from './types/CoreTypes';

export type {
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
} from './types/RouterTypes';

export type { AxonConfig } from './types/ConfigTypes';

export type { AxonPlugin, PluginMode } from './types/PluginTypes';

export type {
  // Axon Validator - Validation feature
  ValidationConfig,
  ValidationSchema,
  ValidationTargets,
} from './types/ValidatorTypes';

// Axon Cookie Manager
export type { CookieOptions } from './types/CookieTypes';

// Neuron Container (Axon Dependency Injection System)
export type { Lifecycle } from './types/Dependency';
