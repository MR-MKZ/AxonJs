type Constructor = new (...args: any[]) => any;

type Func = (...args: any[]) => any;

type Instance = object & { constructor: Function }

type DependencyValue = Constructor | Instance | Func;

export type {
    Constructor,
    Func,
    Instance,
    DependencyValue
}