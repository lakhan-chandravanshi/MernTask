import {
  Request,
  Response,
  NextFunction
} from "express";

import {
  verifyAccessToken
} from "../utils/jwt";

import {
  isSessionValid
} from "../utils/session";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token required"
      });

      return;
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyAccessToken(token);

    const valid = await isSessionValid(
      payload.userId,
      payload.sessionId
    );

    if (!valid) {
      res.status(401).json({
        success: false,
        message: "Session expired or logged in from another device"
      });

      return;
    }

    req.user = {
      id: payload.userId,
      role: payload.role,
      sessionId: payload.sessionId
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
}

export function authorize(...roles: string[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });

      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden"
      });

      return;
    }

    next();
  };
}