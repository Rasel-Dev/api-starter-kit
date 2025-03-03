import { createLogger, format, transports } from 'winston';

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

export const sysLog = createLogger({
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: {
    service: 'system-service',
  },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/system.log' }),
  ],
});

// Configure logger
export const logger = createLogger({
  level: 'info',
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});
