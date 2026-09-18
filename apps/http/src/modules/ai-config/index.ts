import { PrismaAIProviderRepository } from "./infrastructure/repositories/prisma-ai-provider.repository";
import { PrismaAIModelRepository } from "./infrastructure/repositories/prisma-ai-model.repository";
import { PrismaAICredentialRepository } from "./infrastructure/repositories/prisma-ai-credential.repository";
import { PrismaAIConfigVersionRepository } from "./infrastructure/repositories/prisma-ai-config-version.repository";
import { PrismaAIAuditLogRepository } from "./infrastructure/repositories/prisma-ai-audit-log.repository";
import { AesEncryptedSecretStorage } from "./infrastructure/security/aes-encrypted-secret.storage";
import { ProviderConnectivityChecker } from "./infrastructure/validation/provider-connectivity.checker";

import { ManageProvidersUseCase } from "./application/use-cases/manage-providers.usecase";
import { ManageModelsUseCase } from "./application/use-cases/manage-models.usecase";
import { ManageCredentialsUseCase } from "./application/use-cases/manage-credentials.usecase";
import { TestCredentialUseCase } from "./application/use-cases/test-credential.usecase";
import { ManageConfigVersionUseCase } from "./application/use-cases/manage-config-version.usecase";
import { GetPublishedInternalConfigUseCase } from "./application/use-cases/get-published-internal-config.usecase";

import { AdminAIConfigController } from "./presentation/controllers/admin-ai-config.controller";
import { InternalAIConfigController } from "./presentation/controllers/internal-ai-config.controller";
import { AdminAIConfigRoutes } from "./presentation/routes/admin-ai-config.routes";
import { InternalAIConfigRoutes } from "./presentation/routes/internal-ai-config.routes";

// 1. Singletons & Infrastructure
export const aiProviderRepository = new PrismaAIProviderRepository();
export const aiModelRepository = new PrismaAIModelRepository();
export const aiCredentialRepository = new PrismaAICredentialRepository();
export const aiConfigVersionRepository = new PrismaAIConfigVersionRepository();
export const aiAuditLogRepository = new PrismaAIAuditLogRepository();
export const secretsStorageService = new AesEncryptedSecretStorage();
export const providerHealthChecker = new ProviderConnectivityChecker();

// 2. Application Use Cases
export const manageProvidersUseCase = new ManageProvidersUseCase(
  aiProviderRepository,
  aiAuditLogRepository
);
export const manageModelsUseCase = new ManageModelsUseCase(
  aiModelRepository,
  aiProviderRepository,
  aiAuditLogRepository
);
export const manageCredentialsUseCase = new ManageCredentialsUseCase(
  aiCredentialRepository,
  aiProviderRepository,
  secretsStorageService,
  aiAuditLogRepository
);
export const testCredentialUseCase = new TestCredentialUseCase(
  aiCredentialRepository,
  aiProviderRepository,
  secretsStorageService,
  providerHealthChecker
);
export const manageConfigVersionUseCase = new ManageConfigVersionUseCase(
  aiConfigVersionRepository,
  aiAuditLogRepository
);
export const getPublishedInternalConfigUseCase = new GetPublishedInternalConfigUseCase(
  aiConfigVersionRepository,
  secretsStorageService
);

// 3. Presentation Controllers
export const adminAIConfigController = new AdminAIConfigController(
  manageProvidersUseCase,
  manageModelsUseCase,
  manageCredentialsUseCase,
  testCredentialUseCase,
  manageConfigVersionUseCase
);
export const internalAIConfigController = new InternalAIConfigController(
  getPublishedInternalConfigUseCase
);

// 4. Routers
export const adminAIConfigRouter = new AdminAIConfigRoutes(adminAIConfigController).router;
export const internalAIConfigRouter = new InternalAIConfigRoutes(internalAIConfigController).router;

export default adminAIConfigRouter;
