import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Ensure log directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        // Console transport with colors
        new transports.Console({
            format: format.combine(
                format.colorize({ all: true }),
                format.printf(
                    ({ level, message, timestamp, stack }) => {
                        if (stack) {
                            return `${timestamp} ${level}: ${message}\n${stack}`;
                        }
                        return `${timestamp} ${level}: ${message}`;
                    },
                ),
            ),
        }),
        // Daily rotating file transport for errors
        new DailyRotateFile({
            level: 'error',
            filename: path.join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
        // Combined log all levels
        new DailyRotateFile({
            filename: path.join(logDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
    exceptionHandlers: [
        new transports.File({ 
            filename: path.join(logDir, 'exceptions.log'),
            handleExceptions: true,
        }),
    ],
    exitOnError: false, // Don't exit on handled exceptions
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    throw reason;
});

// Add colors to the logger
format.colorize().addColors(colors);

export default logger;

// Custom error class for application errors
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handling middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${err.stack}`);
    
    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        // Send generic error in production for non-operational errors
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }

    res.status(statusCode).json({
        status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
