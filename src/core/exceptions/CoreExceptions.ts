import RouterException from '../../Router/exceptions/RouterException';
import { HttpMethods } from '../../types/Router';

/**
 * throw new route duplicate error from core to client
 * @param method Http method
 * @param route Http request route
 */
const routeDuplicateException = (method: keyof HttpMethods, route: string) => {
  throw new RouterException({
    msg: 'Duplicated route!',
    name: 'RouterError -> DUPLICATED_ROUTE',
    meta: {
      type: 'DUPLICATED_ROUTE',
      description: `route "${method} ${route}" is duplicated`,
    },
  });
};

export { routeDuplicateException };
