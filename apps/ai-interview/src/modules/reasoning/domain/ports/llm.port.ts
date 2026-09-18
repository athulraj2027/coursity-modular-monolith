export interface ILLMService {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  generateStructured<T>(
    prompt: string,
    systemPrompt?: string,
    schemaDescription?: string
  ): Promise<T>;
}
