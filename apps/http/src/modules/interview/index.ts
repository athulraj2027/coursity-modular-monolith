// Repositories & Services
import { PrismaInterviewSessionRepository } from "./infrastructure/repositories/prisma-interview-session.repository";
import { PrismaInterviewTemplateRepository } from "./infrastructure/repositories/prisma-interview-template.repository";
import { PrismaInterviewTranscriptRepository } from "./infrastructure/repositories/prisma-interview-transcript.repository";
import { PrismaInterviewAnalyticsRepository } from "./infrastructure/repositories/prisma-interview-analytics.repository";
import { RealtimeTokenService } from "./infrastructure/services/realtime-token.service";
import { IInterviewSessionRepository } from "./domain/repositories/interview-session.repository.interface";
import { IInterviewTemplateRepository } from "./domain/repositories/interview-template.repository.interface";
import { IInterviewTranscriptRepository } from "./domain/repositories/interview-transcript.repository.interface";
import { IInterviewAnalyticsRepository } from "./domain/repositories/interview-analytics.repository.interface";
import { IRealtimeTokenService } from "./domain/services/realtime-token.service.interface";

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

export interface InterviewModuleDependencies {
  sessionRepo?: IInterviewSessionRepository;
  templateRepo?: IInterviewTemplateRepository;
  transcriptRepo?: IInterviewTranscriptRepository;
  analyticsRepo?: IInterviewAnalyticsRepository;
  realtimeTokenService?: IRealtimeTokenService;
}

export function createInterviewModule(deps?: InterviewModuleDependencies) {
  // 1. Resolve Repositories & Services with DI fallback
  const sessionRepo = deps?.sessionRepo || new PrismaInterviewSessionRepository();
  const templateRepo = deps?.templateRepo || new PrismaInterviewTemplateRepository();
  const transcriptRepo = deps?.transcriptRepo || new PrismaInterviewTranscriptRepository();
  const analyticsRepo = deps?.analyticsRepo || new PrismaInterviewAnalyticsRepository();
  const realtimeTokenService = deps?.realtimeTokenService || new RealtimeTokenService();

  // 2. Instantiate Application Use Cases
  const candidateUseCases = new CandidateInterviewUseCases(
    sessionRepo,
    templateRepo,
    transcriptRepo,
    realtimeTokenService
  );

  const adminUseCases = new AdminInterviewUseCases(
    sessionRepo,
    templateRepo,
    transcriptRepo,
    analyticsRepo
  );

  const internalUseCases = new InternalInterviewUseCases(
    sessionRepo,
    transcriptRepo
  );

  // 3. Instantiate Controllers
  const candidateController = new CandidateInterviewController(candidateUseCases);
  const adminController = new AdminInterviewController(adminUseCases);
  const internalController = new InternalInterviewController(internalUseCases);

  // 4. Instantiate Route Handlers
  const candidateRoutes = new CandidateInterviewRoutes(candidateController);
  const adminRoutes = new AdminInterviewRoutes(adminController);
  const internalRoutes = new InternalInterviewRoutes(internalController);

  return {
    candidateRouter: candidateRoutes.router,
    adminRouter: adminRoutes.router,
    internalRouter: internalRoutes.router,
    useCases: {
      candidateUseCases,
      adminUseCases,
      internalUseCases,
    },
    controllers: {
      candidateController,
      adminController,
      internalController,
    },
    repos: {
      sessionRepo,
      templateRepo,
      transcriptRepo,
      analyticsRepo,
    },
    services: {
      realtimeTokenService,
    },
  };
}

// Default Singleton Module Instances for Express Mounting
const defaultModule = createInterviewModule();

// Public Exported Routers
export const candidateInterviewRouter = defaultModule.candidateRouter;
export const adminInterviewRouter = defaultModule.adminRouter;
export const internalInterviewRouter = defaultModule.internalRouter;

// Public Domain, DTO, Policy & Service Exports
export * from "./domain/entities/interview.entity";
export * from "./domain/errors/interview.error";
export * from "./domain/dtos/candidate-interview.dto";
export * from "./domain/dtos/admin-interview.dto";
export * from "./domain/dtos/internal-interview.dto";
export * from "./domain/policies";
export * from "./domain/services/realtime-token.service.interface";
export * from "./domain/repositories/interview-session.repository.interface";
export * from "./domain/repositories/interview-template.repository.interface";
export * from "./domain/repositories/interview-transcript.repository.interface";
export * from "./domain/repositories/interview-analytics.repository.interface";

// Public Application Use Cases & Controllers
export * from "./application/use-cases/candidate-interview.usecases";
export * from "./application/use-cases/admin-interview.usecases";
export * from "./application/use-cases/internal-interview.usecases";
export * from "./presentation/controllers/candidate-interview.controller";
export * from "./presentation/controllers/admin-interview.controller";
export * from "./presentation/controllers/internal-interview.controller";
export * from "./presentation/validators/interview.validator";

export default candidateInterviewRouter;
