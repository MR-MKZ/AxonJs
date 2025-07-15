import type { AxonConfig } from '../../src';
import path from 'path';
import fs from 'fs';

export default {
  DEBUG: false, // default false
  LOGGER: true, // default true
  LOGGER_VERBOSE: false, // default false
  RESPONSE_MESSAGES: {
    notFound: "route '{path}' not found",
  },
  CORS: {
    origin: 'https://github.com',
  },
  HTTPS: {
    key: fs.readFileSync(path.join('examples', 'server.key')),
    cert: fs.readFileSync(path.join('examples', 'server.crt')),
  },
} as AxonConfig;
