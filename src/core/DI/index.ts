import { DependencyValue } from "../../types/Dependency";
import {
    isConstructor,
    isFunction,
    isInstance
} from "./conditions";

/**
 * This is an experimental object to create and manage dependency containers.
 */
export class AxonDIContainer {
    private DependencyStorage = new Map<string, any>();
    private DependencyAliases = new Map<string, string>();

    public register<T>(keys: string | string[], value: T) {
        const names = Array.isArray(keys) ? keys : [keys];
        const [mainName, ...aliases] = names;

        if (
            !isConstructor(value as DependencyValue) &&
            !isInstance(value as DependencyValue) &&
            !isFunction(value as DependencyValue)
        ) {
            throw new Error(`Unsupported dependency type for '${mainName}'`);
        }

        // Set main item, first name as main name.
        this.DependencyStorage.set(mainName, value);

        // Map all aliases for dependency to main item.
        for (const alias of aliases) {
            this.DependencyAliases.set(alias, mainName);
        }
    }

    public resolve<T>(key: string): T {
        const mainKey = this.DependencyAliases.get(key) || key;
        return this.DependencyStorage.get(mainKey);
    }
}

export {
    isFunction,
    isConstructor,
    isInstance
}

export {
    registerDependency,
    funcRunner,
    DependecyStorage,
    DependencyAliases
} from "./DependencyHandler";

export { extractDestructuredThirdArgKeys } from "./tokenizer";