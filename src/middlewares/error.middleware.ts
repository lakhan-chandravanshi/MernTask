import {
  Request,
  Response,
  NextFunction
} from "express";

import { AppError } from "../utils/app-error";

export function errorHandler(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    });

    return;
  }

  if (error.code === "P2002") {
    res.status(409).json({
      success: false,
      message: "Duplicate value"
    });

    return;
  }

  if (error.name === "MulterError") {
    res.status(400).json({
      success: false,
      message: error.message
    });

    return;
  }

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message
  });
}
