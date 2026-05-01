import type { Request, Response, NextFunction, RequestHandler } from "express";
import { activityLogService } from "@modules/activity-log/activity-log.service";
import type { CreateLogPayload } from "@modules/activity-log/activity-log.interface";



export const logActivity = (module: string): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on("finish", () => {
      const statusCode = res.statusCode;
      if (statusCode < 400 && req.user) {
        const payload: CreateLogPayload = {
          user: req.user._id,
          action: `${req.method} ${req.path}`,
          module,
          description: `${req.method} request to ${req.originalUrl}`,
          ipAddress: req.ip || "unknown",
          userAgent: req.get("user-agent") || "unknown",
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        activityLogService.create(payload).catch(() => {
          // Fire and forget - log failure is non-critical
        });
      }
    });
    next();
  };
};
