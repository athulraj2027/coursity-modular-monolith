import {
  IAICredentialRepository,
  IAIProviderRepository,
} from "../../domain/repositories/ai-config.repository.interfaces";
import {
  ISecretsStorageService,
  IProviderHealthChecker,
  ProviderHealthTestResult,
} from "../../domain/services/ai-config.services.interfaces";
import { NotFoundError, BadRequestError } from "@/app/errors";

export class TestCredentialUseCase {
  constructor(
    private readonly credentialRepo: IAICredentialRepository,
    private readonly providerRepo: IAIProviderRepository,
    private readonly secretsStorage: ISecretsStorageService,
    private readonly healthChecker: IProviderHealthChecker
  ) {}

  async testCredentialById(credentialId: string): Promise<ProviderHealthTestResult> {
    const credential = await this.credentialRepo.findById(credentialId);
    if (!credential) {
      throw new NotFoundError(`AI Credential "${credentialId}" not found.`);
    }

    if (credential.status === "REVOKED") {
      throw new BadRequestError("Cannot test a revoked credential.");
    }

    const provider = await this.providerRepo.findById(credential.providerId);
    if (!provider) {
      throw new NotFoundError(`Provider for credential "${credentialId}" not found.`);
    }

    // 1. Fetch secret value
    const secretValue = await this.secretsStorage.getSecret(credential.secretReference);
    if (!secretValue) {
      return {
        valid: false,
        provider: provider.slug,
        checkedAt: new Date().toISOString(),
        latencyMs: 0,
        error: "Secret payload missing from secure vault.",
      };
    }

    // 2. Perform test
    const result = await this.healthChecker.testConnectivity(provider.slug, secretValue);

    // 3. Update credential test stats in database
    await this.credentialRepo.update(credentialId, {
      lastTestedAt: new Date(),
      lastTestStatus: result.valid ? "SUCCESS" : "FAILED",
      lastTestLatency: result.latencyMs,
    });

    return result;
  }
}
