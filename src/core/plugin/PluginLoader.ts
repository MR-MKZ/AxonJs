import { AxonPlugin } from '../../types/Plugin';
import AxonCore from '../AxonCore';
import { logger } from '../utils/coreLogger';

export class PluginLoader {
  private plugins: AxonPlugin[] = [];

  async loadPlugin(plugin: AxonPlugin) {
    plugin.mode = plugin.mode || 'both';
    plugin.name = plugin.name.replace(' ', '-');
    plugin.version = plugin.version.replace(' ', '-');
    this.plugins.push(plugin);
    logger.debug(`Plugin ${plugin.name} (${plugin.version}) [mode: ${plugin.mode}] loaded`);
  }

  async initializePlugins(core: AxonCore) {
    const currentMode = core.getConfig().PROJECT_ENV || 'development';

    this.plugins.forEach(async plugin => {
      if (
        plugin.mode === 'both' ||
        (plugin.mode === 'production' && currentMode === 'production') ||
        (plugin.mode === 'development' && currentMode === 'development')
      ) {
        await plugin.init(core);
        logger.info(`Plugin ${plugin.name} (${plugin.version}) [mode: ${plugin.mode}] initialized`);
      } else {
        logger.debug(
          `Plugin ${plugin.name} skipped - not applicable for ${currentMode} environment`
        );
      }
    });
  }

  async getPlugins(mode?: 'production' | 'development' | 'both'): Promise<AxonPlugin[]> {
    if (!mode) {
      return this.plugins;
    }

    return this.plugins.filter(plugin => plugin.mode === 'both' || plugin.mode === mode);
  }
}
