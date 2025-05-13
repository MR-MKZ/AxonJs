import AxonCore from "../core/AxonCore";

/**
 * This type is about the mode of project environment that your plugin built for it.
 * 
 * - production
 * - development
 * - both (both of them)
 */
export type PluginMode = "production" | "development" | "both";

export interface AxonPlugin {
    /**
     * This field submit your plugin name for AxonCore.
     */
    name: string;

    /**
     * This field submit your plugin version for AxonCore. 
     * 
     * NOTE: 
     * *It's better to use semantic versioning and also without 'v' or 'V' keyword.*
     */
    version: string;

    /**
     * This field submit your plugin environment mode to use.
     * 
     * - production
     * - development
     * - both
     */
    mode: PluginMode;

    /**
     * This is the start point of your plugin, Initialize method.
     * @param core An instance of AxonCore that used in project and ready to use.
     */
    init(core: AxonCore): Promise<void>;

    /**
     * Rest of plugin methods.
     */
    [methodName: string]: any;
}