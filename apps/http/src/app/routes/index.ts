import express from 'express';
import authRouter from '@/modules/auth';

const router = express.Router();

router.use("/auth", authRouter);

export default router;