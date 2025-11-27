import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid input',
        errors: validation.error.flatten().fieldErrors as Record<string, string>,
      });
    }
    req.body = validation.data;
    return next();
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid parameters',
        errors: validation.error.flatten().fieldErrors as Record<string, string>,
      });
    }
    Object.assign(req.params, validation.data);
    return next();
  };
};