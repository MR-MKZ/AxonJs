import { AxonPlugin } from "../../types/PluginTypes";
import AxonCore from "../AxonCore";
import { logger } from "../utils/coreLogger";

export class PLuginLoader {
    private plugins: AxonPlugin[] = [];

    async loadPlugin(plugin: AxonPlugin) {
        plugin.name = plugin.name.replace(" ", "-");
        plugin.version = plugin.version.replace(" ", "-");
        this.plugins.push(plugin);
        logger.debug(`Plugin ${plugin.name} (${plugin.version}) loaded`);
    }

    async initializePlugins(core: AxonCore) {
        this.plugins.forEach(plugin => {
            plugin.init(core);
            logger.info(`Plugin ${plugin.name} (${plugin.version}) initialized`)
        })
    }

    async getPlugins(): Promise<AxonPlugin[]> {
        return this.plugins;
    }
}