import { logger } from "../utils/coreLogger";

type Constructor = new (...args: any[]) => any;
type Func = (...args: any[]) => any;
type Instance = object & { constructor: Function }
type DependencyValue = Constructor | Instance | Func;

/** Check if value is a class constructor */
const isConstructor = (value: DependencyValue): value is Constructor => {
    return typeof value === 'function' &&
        !!value.prototype &&
        !!value.prototype.constructor &&
        value.prototype.constructor === value;
}

/** Check if value is a n instance (object) */
const isInstance = (value: DependencyValue): value is Instance => {
    return typeof value === 'object' &&
        value !== null &&
        typeof (value as any).constructor === 'function' &&
        (value as any).constructor.name !== 'Object';
}

/** Check if value is a regular function (not a class) */
const isFunction = (value: DependencyValue): value is Func => {
    return typeof value === 'function' &&
        (!value.prototype || value.prototype.constructor !== value);
}

/** Extract function arguments and return array of argument names */
const extractArgs = (fn: Function): string[] => {
    const fnStr = fn.toString().replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '');
    const match = fnStr.match(/\(([^)]*)\)/);
    if (!match) return [];

    const args = match[1]
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

    if (args.length < 3) return [];

    const thirdArg = args[2];

    // Match only if it's destructured like { db, logger }
    const destructureMatch = thirdArg.match(/^\{([^}]+)\}$/);
    if (!destructureMatch) return [];

    return destructureMatch[1]
        .split(',')
        .map(k => k.trim().replace(/=.*$/, '')) // remove default values
        .filter(Boolean);
}

export {
    Func,
    Constructor,
    Instance,
    isFunction,
    isConstructor,
    isInstance,
    extractArgs,
    DependencyValue
}

export {
    registerDependency,
    funcRunner,
    DependecyStorage,
    DependencyAliases
} from "./DependencyHandler"