import pino from 'pino'
import pinoPretty from 'pino-pretty'
import moment from 'moment'

export const logger = pino(
  {
    base: {
      pid: false,
    },
    timestamp: () => `,"time":"${moment().format()}"`
  },
  pinoPretty()
)