import type {
    Constructor,
    Func,
    Instance,
    DependencyValue
} from ".";
import { isFunction, isConstructor, isInstance, extractArgs } from ".";
import { Request, Response } from "../../types/RouterTypes";
import { isAsync } from "../utils/helpers";

// TODO: Convert dependency extractor from regex detection to tokenizer system.

const DependecyStorage = new Map<string, DependencyValue>();
const DependencyAliases = new Map<string, string>();

const registerDependency = async (name: string | string[], dependency: DependencyValue) => {
    const names = Array.isArray(name) ? name : [name];
    const [mainName, ...aliases] = names;

    if (!isConstructor(dependency) && !isInstance(dependency) && !isFunction(dependency)) {
        throw new Error(`Unsupported dependency type for '${mainName}'`);
    }

    // Set main item, first name as main name.
    DependecyStorage.set(mainName, dependency);

    // Map all aliases for dependency to main item.
    for (const alias of aliases) {
        DependencyAliases.set(alias, mainName);
    }
}

const funcRunner = async (func: Function, req: Request<any>, res: Response, manualArgs?: string[]) => {
    let args = manualArgs || extractArgs(func);

    const dependencies: { [name: string]: any } = {};

    args.map(arg => {
        const realName = DependencyAliases.get(arg) || arg;
        let dep = DependecyStorage.get(realName);

        if (!dep) {
            throw new Error(
                `Dependency '${arg}' not found ❌`,
                {
                    cause: "You can only add dependencies that the core has them."
                }
            )
        }

        if (isConstructor(dep)) {
            const instance = new dep();
            DependecyStorage.set(realName, instance);
            dependencies[arg] = instance;
            return;
        }

        if (isInstance(dep)) {
            dependencies[arg] = dep;
            return;
        }

        if (isFunction(dep)) {
            dependencies[arg] = dep;
            return;
        }

        throw new Error(`Unsupported dependency type for '${arg}'`);
    });

    if (isAsync(func)) {
        await func(req, res, dependencies);
    } else {
        func(req, res, dependencies);
    }
}

export {
    DependecyStorage,
    DependencyAliases,
    funcRunner,
    registerDependency
}