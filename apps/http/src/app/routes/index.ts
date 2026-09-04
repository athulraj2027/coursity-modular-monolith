import express from 'express';
import authRouter from '@/modules/auth';
import userRouter from '@/modules/user';
import { authMiddleware } from '@/app/middlewares/auth.middleware';
import { isBlockedMiddleware } from '@/app/middlewares/is-blocked.middleware';
import { idempotencyMiddleware } from '@/app/middlewares/idempotency.middleware';

const router = express.Router();

// 1. Global Idempotency Layer (Handles Idempotency-Key across all API mutations)
router.use(idempotencyMiddleware);

// 2. Auth routes (Public signup/signin/OTP + protected /me)
router.use("/auth", authRouter);

// 3. Protected User routes
router.use(authMiddleware);
router.use(isBlockedMiddleware);
router.use("/users", userRouter);

export default router;

