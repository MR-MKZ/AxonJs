import AxonCore from "./core";
import AxonRouter from "./Router";
import { JsonResponse } from "./types";
import { AxonCoreConfig } from "./core/coreTypes";
 
const Router = () => {
    return new AxonRouter()
}

declare module 'http' {
  interface IncomingMessage {
    body?: any;
  }
}

export {
    AxonCore,
    Router,
    JsonResponse,
    AxonCoreConfig
}