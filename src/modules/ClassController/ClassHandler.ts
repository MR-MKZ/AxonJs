import { BaseController, ControllerRegistry } from '.';
import { ClassController, FuncController } from '../../types/RouterTypes';
/**
 * Creates an executable request handler from a class-based route definition.
 * It fetches the controller's singleton instance and returns a correctly bound method.
 *
 * @param classRouteHandler A tuple [ControllerClass, 'methodName']
 * @returns An executable route handler function `(req, res) => ...`
 */
export const createClassHandler = (
  controllerClassHandler: ClassController<any, any>
): [FuncController, Function] => {
  const [ControllerClass, methodName] = controllerClassHandler;

  // Check if the controller class extends BaseController
  if (!(ControllerClass?.prototype instanceof BaseController)) {
    throw new Error(`Controller class must extend BaseController`, {
      cause: ControllerClass,
    });
  }

  const instance = ControllerRegistry.getInstance(ControllerClass);

  const unboundMethod = (ControllerClass.prototype as any)[methodName];

  // const args = extractDestructuredThirdArgKeys(unboundMethod);

  try {
    return [instance[methodName].bind(instance), unboundMethod];
  } catch (error) {
    throw new Error(`Method ${methodName.toString()} is not bound to the instance`);
  }
};
