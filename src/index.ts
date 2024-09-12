import AxonCore from "./core";
import AxonRouter from "./Router";
import { JsonResponse } from "./types";
import { AxonCoreConfig } from "./core/coreTypes";
import * as http from "http"

const Router = () => {
  return new AxonRouter()
}

declare module 'http' {
  interface IncomingMessage {
    /**
     * the body of request which sent from client
     */
    body?: any;
    /**
     * incoming request parameters in request path
     * 
     * example: 
     * - route: `/api/v1/user/:id`
     * - path: `/api/v1/user/12`
     * - params: { "id": 12 }
     */
    params: any;
  }
}

interface Request extends http.IncomingMessage {};
interface Response extends http.ServerResponse {};
interface Headers extends http.OutgoingHttpHeaders {};

export {
  AxonCore,
  Router,
  JsonResponse,
  AxonCoreConfig,
  Request,
  Response,
  Headers
}