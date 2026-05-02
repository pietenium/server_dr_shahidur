import { body } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";

const checkValidationResult = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : undefined,
      message: err.msg as string,
    }));
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", formattedErrors),
    );
  }
  next();
};

export const analyticsValidator = {
  track: [
    body("page").notEmpty().withMessage("Page is required"),
    body("sessionId").notEmpty().withMessage("Session ID is required"),
    body("visitorId").optional().isString(),
    body("referrer").optional().isString(),
    checkValidationResult,
  ],
};
