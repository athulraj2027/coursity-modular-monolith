import express from 'express';
import authRouter from '@/modules/auth';
import userRouter from '@/modules/user';

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);

export default router;