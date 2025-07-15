import { extractDestructuredThirdArgKeys } from './tokenizer';
import NeuronContainer from './NeuronContainer';

// Types
import type { Lifecycle } from '../../types/Dependency';

/**
 * Axon dependency handler created to handle core dependencies and lifecycle
 */
class AxonDependencyHandler {
  private container: NeuronContainer;

  constructor() {
    this.container = new NeuronContainer();
  }

  /**
   * Static method to extract the dependencies of a handler (Class constructor, Clas method, Function)
   * @param handler The handler that you want to extract its dependencies
   * @returns Array of dependency names
   */
  static extractDependencies(handler: Function): string[] {
    return extractDestructuredThirdArgKeys(handler);
  }

  /**
   * Register new dependency in a container
   * @param keys Key or alias of the dependency
   * @param handler Handler which should inject as dependency
   * @param options Options of the dependency storage
   */
  public register<T>(
    keys: string | string[] | Function,
    handler: T | (() => T | Promise<T>),
    options: { lifecycle?: Lifecycle; isFactory: boolean }
  ) {
    this.container.register(keys, handler, options);
  }

  /**
   * resolve all dependency values and return them as object
   * @param keys Key or alias of the dependency
   * @returns Object of dependency values
   */
  public async resolve(keys: string | string[]) {
    const dependencies: { [name: string]: any } = {};

    if (!Array.isArray(keys)) {
      dependencies[keys] = await this.container.resolve(keys);

      return dependencies;
    }

    keys.forEach(async key => {
      dependencies[key] = await this.container.resolve(key);
    });

    return dependencies;
  }

  /**
   * @returns Dependency container that is using by Axon core
   */
  public getContainer(): NeuronContainer {
    return this.container;
  }
}

export default AxonDependencyHandler;
