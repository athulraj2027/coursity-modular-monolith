import express from 'express';
import authRouter from '@/modules/auth';
import userRouter from '@/modules/user';
import profileRouter from '@/modules/profile';
import planRouter from '@/modules/plan';
import categoryRouter from '@/modules/category';
import courseRouter from '@/modules/course';
import uploadRouter from '@/infrastructure/storage';
import { candidateInterviewRouter, adminInterviewRouter } from '@/modules/interview';
import { adminAIConfigRouter } from '@/modules/ai-config';

import { authMiddleware } from '@/app/middlewares/auth.middleware';
import { isBlockedMiddleware } from '@/app/middlewares/is-blocked.middleware';
import { idempotencyMiddleware } from '@/app/middlewares/idempotency.middleware';

const router = express.Router();

// 1. Global Idempotency Layer (Handles Idempotency-Key across all API mutations)
router.use(idempotencyMiddleware);

// 2. Auth routes (Public signup/signin/OTP + protected /me)
router.use("/auth", authRouter);

// 3. Subscription & Pricing Plan routes (Public listing + protected teacher/admin operations)
router.use("/plans", planRouter);

// 4. Categories & Hierarchy routes (Public listing + protected admin management)
router.use("/categories", categoryRouter);

// 5. Courses & Curriculum routes (Public discovery + Teacher studio + Admin moderation)
router.use("/courses", courseRouter);

// 4. AI Interview routes (Candidate endpoints & Admin management)
router.use("/interviews", candidateInterviewRouter);
router.use("/admin/interviews", adminInterviewRouter);
router.use("/admin/ai", adminAIConfigRouter);

// 5. Storage & File Upload routes (contains internal auth for presigned-url and delete, open PUT for local binary upload)
router.use("/upload", uploadRouter);

// 6. Protected User & Profile routes
router.use(authMiddleware);
router.use(isBlockedMiddleware);
router.use("/users", userRouter);
router.use("/profile", profileRouter);

export default router;
