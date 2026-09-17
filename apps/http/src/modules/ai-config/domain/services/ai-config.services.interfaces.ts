export interface ISecretsStorageService {
  /**
   * Encrypts and securely stores an API key/secret value.
   * Returns a generated unique reference key (e.g. "ai-interview/gemini/prod-xyz").
   */
  storeSecret(secretReference: string, secretValue: string): Promise<void>;

  /**
   * Retrieves and decrypts the secret value for internal runtime consumption.
   * Returns null if not found.
   */
  getSecret(secretReference: string): Promise<string | null>;

  /**
   * Permanently deletes a secret from storage.
   */
  deleteSecret(secretReference: string): Promise<boolean>;
}

export interface ProviderHealthTestResult {
  valid: boolean;
  provider: string;
  checkedAt: string;
  latencyMs: number;
  message?: string;
  error?: string;
}

export interface IProviderHealthChecker {
  testConnectivity(
    providerSlug: string,
    secretValue: string,
    modelId?: string
  ): Promise<ProviderHealthTestResult>;
}
