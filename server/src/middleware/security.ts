import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Sanitize input to prevent XSS and injection attacks
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
      }
      const sanitized: Record<string, unknown> = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue((value as Record<string, unknown>)[key]);
      }
      return sanitized;
    }
    return value;
  };

  // Only sanitize body (query and params are read-only in newer Express)
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  next();
};

// Log security events
export const logSecurityEvent = (event: string, details: Record<string, unknown>) => {
  logger.warn('Security event:', { event, details, timestamp: new Date().toISOString() });
};

// Validate request size
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    logSecurityEvent('Large request detected', { 
      ip: req.ip, 
      size: contentLength,
      url: req.url 
    });
    return res.status(413).json({ message: 'Request too large' });
  }
  return next();
};

// Basic request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration,
      timestamp: new Date().toISOString(),
    };

    // Log suspicious activity
    if (res.statusCode >= 400) {
      logger.warn('HTTP error response:', logData);
    } else {
      logger.info('HTTP request:', logData);
    }
  });

  next();
};