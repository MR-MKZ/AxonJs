import AxonRouter from "../../Router/AxonRouter";
import { HttpMethods } from "../../types/RouterTypes";
import { logger } from "../utils/coreLogger";

interface UnloadRouteParams {
    router?: AxonRouter;
    method?: keyof HttpMethods;
    route?: string;
    _routes: HttpMethods;
}

export type UnloadRoute = ({ }: UnloadRouteParams) => Promise<void>;

export const unloadRouteService: UnloadRoute = async ({ route, method, router, _routes }) => {
    if (router) {
        const routerRoutes: HttpMethods = router.exportRoutes();

        (Object.keys(routerRoutes) as Array<keyof HttpMethods>).forEach((method) => {
            if (Object.keys(routerRoutes[method]).length > 0) {
                Object.keys(routerRoutes[method]).forEach((route) => {
                    if (_routes[method][route]) {
                        delete _routes[method][route]
                        delete _routes['OPTIONS'][route]

                        logger.debug(`unloaded route ${method} ${route}`)
                    }
                })
            }
        })
    }

    if (method) {
        _routes[method] = {};

        logger.debug(`unloaded method ${method} routes`)
    }

    if (route) {
        let deleted = false;
        (Object.keys(_routes) as Array<keyof HttpMethods>).forEach((method) => {
            if (Object.keys(_routes[method]).length > 0) {
                Object.keys(_routes[method]).forEach((_route) => {
                    if (_route === route) {
                        delete _routes[method][_route]
                        delete _routes['OPTIONS'][_route]

                        deleted = true;

                        logger.debug(`unloaded route ${method} ${_route}`)
                    }
                })
            }
        })

        if (!deleted) logger.debug(`route ${route} not found`)
    }
}

export const unloadRoutesService = async (_routes: HttpMethods) => {
    (Object.keys(_routes) as Array<keyof HttpMethods>).forEach(method => {
        _routes[method] = {};
    });

    logger.debug("all routes unloaded")

    return _routes;
}