import AxonCore from "../core/AxonCore";

export interface AxonPlugin {
    name: string;
    version: string;
    init(core: AxonCore): void;
    [methodName: string]: any;
}