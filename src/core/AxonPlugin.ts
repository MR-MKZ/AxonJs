import AxonCore from "./AxonCore";

export interface AxonPlugin {
    init(core: AxonCore): void;
    [key: string]: any;
}