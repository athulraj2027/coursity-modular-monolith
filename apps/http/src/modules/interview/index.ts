// Repositories & Services
import { PrismaInterviewSessionRepository } from "./infrastructure/repositories/prisma-interview-session.repository";
import { PrismaInterviewTemplateRepository } from "./infrastructure/repositories/prisma-interview-template.repository";
import { PrismaInterviewTranscriptRepository } from "./infrastructure/repositories/prisma-interview-transcript.repository";
import { PrismaInterviewAnalyticsRepository } from "./infrastructure/repositories/prisma-interview-analytics.repository";
import { RealtimeTokenService } from "./infrastructure/services/realtime-token.service";

// Use Cases
import { CandidateInterviewUseCases } from "./application/use-cases/candidate-interview.usecases";
import { AdminInterviewUseCases } from "./application/use-cases/admin-interview.usecases";
import { InternalInterviewUseCases } from "./application/use-cases/internal-interview.usecases";

// Controllers
import { CandidateInterviewController } from "./presentation/controllers/candidate-interview.controller";
import { AdminInterviewController } from "./presentation/controllers/admin-interview.controller";
import { InternalInterviewController } from "./presentation/controllers/internal-interview.controller";

// Routes
import { CandidateInterviewRoutes } from "./presentation/routes/candidate-interview.routes";
import { AdminInterviewRoutes } from "./presentation/routes/admin-interview.routes";
import { InternalInterviewRoutes } from "./presentation/routes/internal-interview.routes";

// 1. Instantiate Infrastructure Repositories & Services
const sessionRepository = new PrismaInterviewSessionRepository();
const templateRepository = new PrismaInterviewTemplateRepository();
const transcriptRepository = new PrismaInterviewTranscriptRepository();
const analyticsRepository = new PrismaInterviewAnalyticsRepository();
const realtimeTokenService = new RealtimeTokenService();

// 2. Instantiate Application Use Cases
const candidateUseCases = new CandidateInterviewUseCases(
  sessionRepository,
  templateRepository,
  transcriptRepository,
  realtimeTokenService
);

const adminUseCases = new AdminInterviewUseCases(
  sessionRepository,
  templateRepository,
  transcriptRepository,
  analyticsRepository
);

const internalUseCases = new InternalInterviewUseCases(
  sessionRepository,
  transcriptRepository
);

// 3. Instantiate Controllers
const candidateController = new CandidateInterviewController(candidateUseCases);
const adminController = new AdminInterviewController(adminUseCases);
const internalController = new InternalInterviewController(internalUseCases);

// 4. Instantiate Route Handlers
const candidateRoutes = new CandidateInterviewRoutes(candidateController);
const adminRoutes = new AdminInterviewRoutes(adminController);
const internalRoutes = new InternalInterviewRoutes(internalController);

// Public Exported Routers
export const candidateInterviewRouter = candidateRoutes.router;
export const adminInterviewRouter = adminRoutes.router;
export const internalInterviewRouter = internalRoutes.router;

// Public Domain & DTO Exports
export * from "./domain/entities/interview.entity";
export * from "./domain/errors/interview.error";
export * from "./domain/dtos/candidate-interview.dto";
export * from "./domain/dtos/admin-interview.dto";
export * from "./domain/dtos/internal-interview.dto";

export default candidateInterviewRouter;
