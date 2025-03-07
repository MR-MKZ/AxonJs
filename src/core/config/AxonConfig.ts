// libs
import { lilconfig } from 'lilconfig';
import esbuild from 'esbuild';
import { pathToFileURL } from 'url';

// utils
import { logger } from '../utils/coreLogger';

// types
import type { AxonConfig } from "../../types/ConfigTypes";

// default items
import defaultConfig from './defaultConfig';

const dynamicImport = new Function('file', 'return import(file)');

async function loadJSConfig(filePath: string) {
    const fileUrl = pathToFileURL(filePath).href;
    const module = await dynamicImport(fileUrl);
    return module.default || module;
}

async function loadTSConfig(filePath: string) {
    const result = await esbuild.build({
        entryPoints: [filePath],
        bundle: true,
        external: ["esbuild"],
        platform: 'node',
        format: 'cjs',
        target: 'es2020',
        write: false,
    });
    const code = result.outputFiles[0].text;
    const module = { exports: {} };
    const fn = new Function('module', 'exports', 'require', code);
    fn(module, module.exports, require);
    return module.exports;
}

export async function resolveConfig(): Promise<AxonConfig> {
    const explorer = lilconfig('axon', {
        searchPlaces: [
            'axon.config.ts',
            'axon.config.js',
            'axon.config.cjs',
            'axon.config.mjs',
        ],
        loaders: {
            '.ts': (filePath) => loadTSConfig(filePath),
            '.mjs': (filePath) => loadJSConfig(filePath),
            '.js': (filePath) => require(filePath),
            '.cjs': (filePath) => require(filePath),
        }
    });

    const result = await explorer.search(process.cwd());

    if (!result?.config) return defaultConfig;

    if (Object.keys(result.config).includes("default")) result.config = result.config?.default;

    const config = { ...defaultConfig, ...result.config };

    if (config.DEBUG) {
        logger.level = "debug"
    }

    if (!config.LOGGER) {
        logger.level = "silent"
    }

    logger.debug(config, "Loaded config");

    return config;
}