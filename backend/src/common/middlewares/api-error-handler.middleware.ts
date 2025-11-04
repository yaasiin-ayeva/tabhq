import { NextFunction, Request, Response } from "express";
import logger from "../logger";

const apiErrorHandlerMiddleware = (error: any, req: Request, res: Response, _next: NextFunction) => {

    if (isNaN(Number(error.statusCode))) {
        var stack = error.stack;
    }

    logger.error(`Error ${error.statusCode}: ${error.message} ${stack ? 'Stack' + stack : ''}`, { url: req.url, method: req.method },);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        error: statusCode === 500 ? 'Internal Server Error' : error.message
    });
}

export default apiErrorHandlerMiddleware;