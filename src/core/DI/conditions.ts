import type {
    DependencyValue,
    Constructor,
    Func,
    Instance
} from "../../types/Dependency";

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

export {
    isConstructor,
    isFunction,
    isInstance
}