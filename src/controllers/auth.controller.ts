import {
  Request,
  Response,
  NextFunction
} from "express";

import {
  registerUser,
  loginUser,
  logoutUser
} from "../services/auth.service";

import {
  verifyRefreshToken,
  generateAccessToken
} from "../utils/jwt";

import {
  getSession
} from "../utils/session";

import { AppError } from "../utils/app-error";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    const user = await registerUser(
      name,
      email,
      password
    );

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Welcome email queued.",
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      email,
      password
    } = req.body;

    const result = await loginUser(
      email,
      password,
      {
        deviceId:
          req.headers["x-device-id"]?.toString(),
        userAgent: req.headers["user-agent"],
        ip: req.ip
      }
    );

    res.cookie(
      "refreshToken",
      result.refreshToken,
      {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: "strict",
        maxAge:
          7 * 24 * 60 * 60 * 1000
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token =
      req.cookies.refreshToken;

    if (!token) {
      throw new AppError(
        "Refresh token required",
        401
      );
    }

    const payload =
      verifyRefreshToken(token);

    const session =
      await getSession(payload.userId);

    if (!session) {
      throw new AppError(
        "Session expired",
        401
      );
    }

    if (
      session.sessionId !==
      payload.sessionId
    ) {
      throw new AppError(
        "Session no longer active",
        401
      );
    }

    const user =
      await import("../config/prisma").then(
        ({ prisma }) =>
          prisma.user.findUnique({
            where: {
              id: payload.userId
            }
          })
      );

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    const accessToken =
      generateAccessToken({
        userId: user.id,
        sessionId: session.sessionId,
        role: user.role
      });

    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new AppError(
        "Unauthorized",
        401
      );
    }

    await logoutUser(req.user.id);

    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    next(error);
  }
}