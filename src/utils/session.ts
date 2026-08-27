import { redis } from "../config/redis";
import { env } from "../config/env";

export interface SessionData {
  userId: string;
  sessionId: string;
  deviceId: string;
  userAgent?: string;
  ip?: string;
  createdAt: string;
}

function getSessionKey(userId: string) {
  return `session:${userId}`;
}

function getDeviceKey(userId: string) {
  return `device:${userId}`;
}

export async function createSession(
  data: SessionData
) {
  const sessionKey = getSessionKey(data.userId);
  const deviceKey = getDeviceKey(data.userId);

  // Remove previous session.
  await redis.del(sessionKey);
  await redis.del(deviceKey);

  await redis.set(
    sessionKey,
    JSON.stringify(data),
    "EX",
    env.SESSION_TTL
  );

  await redis.set(
    deviceKey,
    data.deviceId,
    "EX",
    env.SESSION_TTL
  );
}

export async function getSession(
  userId: string
): Promise<SessionData | null> {
  const data = await redis.get(
    getSessionKey(userId)
  );

  if (!data) {
    return null;
  }

  return JSON.parse(data) as SessionData;
}

export async function deleteSession(
  userId: string
) {
  await redis.del(getSessionKey(userId));
  await redis.del(getDeviceKey(userId));
}

export async function isSessionValid(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const session = await getSession(userId);

  if (!session) {
    return false;
  }

  return session.sessionId === sessionId;
}