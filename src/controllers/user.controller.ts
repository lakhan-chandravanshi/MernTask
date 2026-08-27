import {
  Request,
  Response,
  NextFunction
} from "express";

import {
  getUserById,
  updateAvatar
} from "../services/auth.service";

import { AppError } from "../utils/app-error";

export async function getProfile(
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

    const user =
      await getUserById(req.user.id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatar(
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

    if (!req.file) {
      throw new AppError(
        "Avatar file is required",
        400
      );
    }

    const avatar =
      `/uploads/${req.file.filename}`;

    const user =
      await updateAvatar(
        req.user.id,
        avatar
      );

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: user
    });
  } catch (error) {
    next(error);
  }
}