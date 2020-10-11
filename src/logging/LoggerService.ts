import { createLogger, format, transports } from 'winston';

const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

export const logger = createLogger({
  format: format.combine(format.timestamp(), customFormat),
  transports: [new transports.Console()],
});
