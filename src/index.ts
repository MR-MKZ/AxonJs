import HttpRouterCore from "./core";
import AxonRouter from "./Router";
import { JsonResponse } from "./types";
import { AxonCoreConfig } from "./core/coreTypes";

const Router = () => {
    return new AxonRouter()
}

export {
    HttpRouterCore,
    Router,
    JsonResponse,
    AxonCoreConfig
}