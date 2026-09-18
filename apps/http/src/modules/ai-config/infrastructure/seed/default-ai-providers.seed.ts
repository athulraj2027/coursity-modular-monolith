import { PrismaClient } from "@prisma/client";
import defaultPrisma from "@/infrastructure/database/prisma.client";

export const DEFAULT_AI_PROVIDERS = [
  {
    slug: "gemini",
    name: "Google Gemini",
    type: "LLM" as const,
    models: [
      { name: "Gemini 1.5 Flash", modelId: "gemini-1.5-flash", type: "LLM" as const, contextWindow: 1000000 },
      { name: "Gemini 1.5 Pro", modelId: "gemini-1.5-pro", type: "LLM" as const, contextWindow: 2000000 },
      { name: "Gemini 2.0 Flash", modelId: "gemini-2.0-flash", type: "LLM" as const, contextWindow: 1000000 },
    ],
  },
  {
    slug: "openai",
    name: "OpenAI",
    type: "LLM" as const,
    models: [
      { name: "GPT-4o Mini", modelId: "gpt-4o-mini", type: "LLM" as const, contextWindow: 128000 },
      { name: "GPT-4o", modelId: "gpt-4o", type: "LLM" as const, contextWindow: 128000 },
      { name: "GPT-3.5 Turbo", modelId: "gpt-3.5-turbo", type: "LLM" as const, contextWindow: 16385 },
    ],
  },
  {
    slug: "anthropic",
    name: "Anthropic Claude",
    type: "LLM" as const,
    models: [
      { name: "Claude 3.5 Sonnet", modelId: "claude-3-5-sonnet", type: "LLM" as const, contextWindow: 200000 },
      { name: "Claude 3 Haiku", modelId: "claude-3-haiku", type: "LLM" as const, contextWindow: 200000 },
    ],
  },
  {
    slug: "deepgram",
    name: "Deepgram",
    type: "STT" as const,
    models: [
      { name: "Deepgram Nova-2 (STT)", modelId: "nova-2", type: "STT" as const, contextWindow: 0 },
    ],
  },
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    type: "TTS" as const,
    models: [
      { name: "ElevenLabs Turbo v2 (TTS)", modelId: "eleven_turbo_v2", type: "TTS" as const, contextWindow: 0 },
    ],
  },
  {
    slug: "groq",
    name: "Groq Llama",
    type: "LLM" as const,
    models: [
      { name: "Llama 3.1 70B (Groq)", modelId: "llama-3.1-70b-versatile", type: "LLM" as const, contextWindow: 131072 },
    ],
  },
];

export async function seedDefaultAIProviders(prisma: PrismaClient = defaultPrisma) {
  for (const p of DEFAULT_AI_PROVIDERS) {
    const provider = await (prisma as any).aIProvider.upsert({
      where: { slug: p.slug },
      update: { name: p.name, type: p.type },
      create: {
        slug: p.slug,
        name: p.name,
        type: p.type,
        status: "ACTIVE",
      },
    });

    for (const m of p.models) {
      const existingModel = await (prisma as any).aIModel.findFirst({
        where: { providerId: provider.id, modelId: m.modelId },
      });

      if (!existingModel) {
        await (prisma as any).aIModel.create({
          data: {
            providerId: provider.id,
            name: m.name,
            modelId: m.modelId,
            type: m.type,
            metadata: { contextWindow: m.contextWindow },
            status: "ACTIVE",
          },
        });
      }
    }
  }
}
