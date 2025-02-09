import AxonCore from "../core/AxonCore";

export interface AxonPlugin {
    name: string;
    version: string;
    init(core: AxonCore): Promise<void>;
    [methodName: string]: any;
}