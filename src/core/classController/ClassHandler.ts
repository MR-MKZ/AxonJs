import { ControllerRegistry } from "./ControllerRegistry";
import { BaseController } from ".";
import { ClassController, FuncController } from "../../types/RouterTypes";
import { logger } from "../utils/coreLogger";
import { extractArgs } from "../DI";


/**
 * Creates an executable request handler from a class-based route definition.
 * It fetches the controller's singleton instance and returns a correctly bound method.
 *
 * @param classRouteHandler A tuple [ControllerClass, 'methodName']
 * @returns An executable route handler function `(req, res) => ...`
 */
export const createClassHandler = (controllerClassHandler: ClassController<any, any>): [FuncController, string[]] => {
    const [ControllerClass, methodName] = controllerClassHandler;

     // Check if the controller class extends BaseController
    if (!(ControllerClass?.prototype instanceof BaseController)) {
        throw new Error(`Controller class must extend BaseController`, {
            cause: ControllerClass
        });
    }

    const instance = ControllerRegistry.getInstance(ControllerClass);

    const unboundMethod = (ControllerClass.prototype as any)[methodName];

    const args = extractArgs(unboundMethod);

    try {
        return [instance[methodName].bind(instance), args];
    } catch (error) {
        throw new Error(`Method ${methodName.toString()} is not bound to the instance`);
    }

    // const method = (instance as any)[methodName];

    // if (typeof method !== "function") {
    //     throw new Error(`Method '${methodName}' not found on controller '${ControllerClass.name}'.`);
    // }

    // return method;
}