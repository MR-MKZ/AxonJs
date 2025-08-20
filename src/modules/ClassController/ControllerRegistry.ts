import { BaseController } from '.';
import { ControllerConstructor } from '../../types/Router';

/**
 * Manages singleton instances of all controller classes.
 * It ensures that for any given class, only one instance is created.
 */
export class ControllerRegistry {
  // We use a Map where the key is the class constructor itself.
  // This is much safer than using string names.
  private static readonly instances = new Map<ControllerConstructor, BaseController>();

  /**
   * Gets the singleton instance of a controller class.
   * If an instance doesn't exist, it creates one, stores it, and returns it.
   *
   * @param ControllerClass The controller class constructor (e.g., UsersController)
   * @returns The singleton instance of the controller.
   */
  public static getInstance<C extends BaseController>(
    ControllerClass: ControllerConstructor<C>
  ): C {
    if (!this.instances.has(ControllerClass)) {
      // If instance does not exist, create a new one and store it.
      const instance = new ControllerClass();
      this.instances.set(ControllerClass, instance);
    }

    // Return the existing or newly created instance.
    return this.instances.get(ControllerClass) as C;
  }
}
