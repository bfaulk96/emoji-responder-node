import { createLogger, format, transports } from 'winston';

const customFormat = format.printf(({ level, message, timestamp, meta }) => {
  return `${timestamp} [${level}]: ${message}  ${JSON.stringify(meta)}`;
});

export const logger = createLogger({
  format: format.combine(format.timestamp(), customFormat),
  transports: [new transports.Console({ level: 'info' })],
});
