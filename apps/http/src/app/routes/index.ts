import express from 'express';
import authRouter from '@/modules/auth';
import userRouter from '@/modules/user';
import profileRouter from '@/modules/profile';
import { authMiddleware } from '@/app/middlewares/auth.middleware';
import { isBlockedMiddleware } from '@/app/middlewares/is-blocked.middleware';

const router = express.Router();

router.use("/auth", authRouter);
router.use(authMiddleware);
router.use(isBlockedMiddleware);
router.use("/users", userRouter);
router.use("/profile", profileRouter);

export default router;

