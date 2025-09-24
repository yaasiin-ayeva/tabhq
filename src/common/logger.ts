import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, message, timestamp, stack }) => {
                    return stack
                        ? `[${timestamp}] ${level}: ${message}\n${stack}`
                        : `[${timestamp}] ${level}: ${message}`;
                })
            ),
        }),
    ],
});

export default logger;
