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
    body?: any;
  }
}

type Request = http.IncomingMessage;
type Response = http.ServerResponse;

export {
  AxonCore,
  Router,
  JsonResponse,
  AxonCoreConfig,
  Request,
  Response
}