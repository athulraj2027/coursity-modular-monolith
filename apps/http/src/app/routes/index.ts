import express from 'express';
import authRouter from '@/modules/auth';
import userRouter from '@/modules/user';
import { authMiddleware } from '@/app/middlewares/auth.middleware';
import { isBlockedMiddleware } from '@/app/middlewares/is-blocked.middleware';

const router = express.Router();

router.use("/auth", authRouter);
router.use(authMiddleware)
router.use(isBlockedMiddleware)
router.use("/users", userRouter);

export default router;
