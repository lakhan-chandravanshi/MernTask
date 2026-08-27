import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import {
  hashPassword,
  comparePassword
} from "../utils/password";

import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt";

import {
  createSession,
  deleteSession
} from "../utils/session";

import { randomUUID } from "crypto";

import {
  addWelcomeEmailJob
} from "../queues/email.queue";

interface DeviceInfo {
  deviceId?: string;
  userAgent?: string;
  ip?: string;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (existingUser) {
    throw new AppError(
      "Email already registered",
      409
    );
  }

  const passwordHash =
    await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  await addWelcomeEmailJob(
    user.email,
    user.name
  );

  return user;
}

export async function loginUser(
  email: string,
  password: string,
  deviceInfo: DeviceInfo
) {
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const passwordValid =
    await comparePassword(
      password,
      user.passwordHash
    );

  if (!passwordValid) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  /*
   * Every login generates a new session.
   * The previous Redis session is deleted.
   *
   * Therefore only one device can remain
   * authenticated at a time.
   */

  const sessionId = randomUUID();

  const deviceId =
    deviceInfo.deviceId || randomUUID();

  await createSession({
    userId: user.id,
    sessionId,
    deviceId,
    userAgent: deviceInfo.userAgent,
    ip: deviceInfo.ip,
    createdAt: new Date().toISOString()
  });

  const accessToken =
    generateAccessToken({
      userId: user.id,
      sessionId,
      role: user.role
    });

  const refreshToken =
    generateRefreshToken({
      userId: user.id,
      sessionId
    });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },

    accessToken,
    refreshToken
  };
}

export async function logoutUser(
  userId: string
) {
  await deleteSession(userId);
}

export async function getUserById(
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  return user;
}

export async function updateAvatar(
  userId: string,
  avatar: string
) {
  return prisma.user.update({
    where: {
      id: userId
    },

    data: {
      avatar
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true
    }
  });
}