import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto<T>(dtoClass: new () => T, source: "body" | "params" | "query" = "body") {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dto = plainToInstance(dtoClass, req[source]);
        const errors = await validate(dto as any, { whitelist: true, forbidNonWhitelisted: true });

        if (errors.length > 0) {
            return res.status(400).json({
                error: "Validation failed",
                details: errors.map((e) => ({ property: e.property, constraints: e.constraints })),
            });
        }

        req[source] = dto;
        next();
    };
}
