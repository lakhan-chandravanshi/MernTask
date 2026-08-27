import { Router } from "express";

import {
  register,
  login,
  logout,
  refreshToken
} from "../controllers/auth.controller";

import {
  authenticate
} from "../middlewares/auth.middleware";

import {
  validate
} from "../middlewares/validate.middleware";

import {
  registerSchema,
  loginSchema
} from "../schemas/auth.schema";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post(
  "/refresh",
  refreshToken
);

router.post(
  "/logout",
  authenticate,
  logout
);

export default router;