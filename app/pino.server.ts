import { randomUUID } from 'crypto'
import type { IncomingMessage, ServerResponse } from 'http'
import os from 'os'

import pinoHttp from 'pino-http'
import makePino from 'pino'

const BASE_LOG_ATTRIBUTES = {
  scope: 'RemixApplication',
  hostname: os.hostname(),
  pid: process.pid
}

export const baseLogger = makePino({ base: BASE_LOG_ATTRIBUTES })

export const pino = pinoHttp(
  {
    logger: baseLogger,
    genReqId (req: IncomingMessage) {
      const datadogTrace = req.headers['X-Datadog-Trace-ID']
      if (datadogTrace !== undefined) {
        return datadogTrace
      }
      const xRequestTrace = req.headers['X-Request-ID']
      if (xRequestTrace !== undefined) {
        return xRequestTrace
      }
      return randomUUID()
    },
    customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => `${req.method ?? 'UNK'} ${req.url ?? 'undefined'} ${res.statusCode}`,
    customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) => `${req.method ?? 'UNK'} ${req.url ?? 'undefined'} ${res.statusCode}: (${err.name}) ${err.message}`
  },
  undefined
)
