import AxonCore from "./core/AxonCore";
import AxonRouter from "./Router/AxonRouter";
import { Controller, Middleware , nextFn} from "./types";
import { AxonCoreConfig } from "./core/coreTypes";
import * as http from "http"
import AxonResponse from "./core/AxonResponse";
import { AxonResponseMessage } from "./core/coreTypes";
import { AxonPlugin } from "./types/AxonPlugin";

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

  interface ServerResponse {
    /**
     * to add http response code for client.
     * @param code http response code
     */
    status: (code: number) => AxonResponse;
  }
}

interface Request extends http.IncomingMessage {};
interface Response extends http.ServerResponse {};
interface Headers extends http.OutgoingHttpHeaders {};

export {
  AxonCore,
  Router,
  AxonCoreConfig,
  AxonResponseMessage,
  Request,
  Response,
  Headers,
  nextFn,
  AxonPlugin,
  Controller,
  Middleware
}