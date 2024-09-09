import pino from 'pino';
import pretty from 'pino-pretty';

const prettyStream = pretty({
  colorize: true,
  translateTime: 'HH:MM:ss.l',
  ignore: 'pid,hostname',
  customLevels: {
    fatal: 60,
    error: 50,
    warn: 40,
    request: 35,  // HTTP request logs
    core: 34,     // Core system messages
    coreDebug: 33, // Core debug messages
    info: 30,
    debug: 20,
    trace: 10
  },
  customColors: 'fatal:red,error:red,core:magenta,coreDebug:blue,request:cyan,info:green,debug:yellow,trace:white',
});

const logger = pino(
  {
    level: 'info',
    customLevels: {
      fatal: 60,
      error: 50,
      warn: 40,
      request: 35,
      core: 34,
      coreDebug: 33,
      info: 30,
      debug: 20,
      trace: 10
    },
    useOnlyCustomLevels: false
  },
  prettyStream
);

export {
  logger
}