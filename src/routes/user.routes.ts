import { Router } from "express";

import {
  getProfile,
  uploadAvatar
} from "../controllers/user.controller";

import {
  authenticate
} from "../middlewares/auth.middleware";

import {
  upload
} from "../middlewares/upload.middleware";

const router = Router();

router.get(
  "/profile",
  authenticate,
  getProfile
);

router.post(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  uploadAvatar
);

export default router;