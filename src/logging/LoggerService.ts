import { createLogger, format, LogEntry, transports } from 'winston';

const customFormat = format.printf((info: LogEntry) => {
  const { level, message, timestamp, metadata } = info;
  return `${timestamp} [${level}]: ${message}  ` + metadata ?? '';
});

export const logger = createLogger({
  format: format.combine(format.timestamp(), customFormat, format.colorize()),
  transports: [new transports.Console({ level: 'info' })],
});
