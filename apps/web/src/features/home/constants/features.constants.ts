export interface FeatureItem {
  id: string
  title: string
  subtitle: string
  description: string
  badge: string
  iconName: "Video" | "Mic" | "Layers" | "Zap"
  highlights: string[]
}

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: "live-classes",
    title: "Interactive Live Classrooms",
    subtitle: "Low-latency HD streaming with real-time Q&A",
    description:
      "Join weekly interactive build sessions with experienced engineers. Ask questions via live chat, debug complex systems in real time, and access automated cloud recordings right after class.",
    badge: "Live Broadcast",
    iconName: "Video",
    highlights: [
      "Low-latency WebRTC & HLS streaming",
      "Real-time classroom chat & instant Q&A",
      "Automatic cloud recording playback",
    ],
  },
  {
    id: "ai-interviews",
    title: "AI Voice Interview Studio",
    subtitle: "Low-latency voice simulations with rubric scoring",
    description:
      "Practice technical and architectural interviews with our low-latency conversational AI engine powered by Gemini, Deepgram, and ElevenLabs. Get multi-dimensional evaluation dossiers across code depth, pedagogy, and problem solving.",
    badge: "AI Powered",
    iconName: "Mic",
    highlights: [
      "Real-time conversational voice with barge-in detection",
      "Multi-dimensional rubric scoring & feedback dossiers",
      "Adaptive technical probing & scenario questions",
    ],
  },
  {
    id: "modular-curriculum",
    title: "Production Video Curriculum",
    subtitle: "Modular tracks designed for real-world engineering",
    description:
      "Master end-to-end architectures from scalable microservices to autonomous AI agents and cloud infrastructure. Structured into bite-sized lessons with high-bitrate video streaming and downloadable resources.",
    badge: "Modular",
    iconName: "Layers",
    highlights: [
      "Step-by-step categorized module roadmaps",
      "Production-grade code patterns & architectures",
      "Continuous progress tracking & verifiable skills",
    ],
  },
]
