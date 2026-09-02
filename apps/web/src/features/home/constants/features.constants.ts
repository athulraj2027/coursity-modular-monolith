export interface FeatureItem {
  id: string
  title: string
  subtitle: string
  description: string
  badge: string
  iconName: "Video" | "Bot" | "HelpCircle" | "Zap"
  highlights: string[]
}

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: "live-classes",
    title: "Interactive Live Classes",
    subtitle: "Real-time mentorship & pair programming",
    description:
      "Join weekly live build sessions with experienced engineers. Ask questions in real time, debug live architectures, and collaborate on production codebases.",
    badge: "Realtime",
    iconName: "Video",
    highlights: [
      "Live terminal & pair coding",
      "Direct Q&A with lead mentors",
      "Instant session recordings & notes",
    ],
  },
  {
    id: "ai-assessments",
    title: "Intelligent AI Assessments",
    subtitle: "Instant automated code review & feedback",
    description:
      "Get real-time static analysis, time/space complexity evaluation, and targeted AI hints on your code submissions to refine your problem-solving.",
    badge: "AI Powered",
    iconName: "Bot",
    highlights: [
      "Sub-second test suite validation",
      "Complexity analysis & hints",
      "Automated edge case diagnostics",
    ],
  },
  {
    id: "quizzes",
    title: "Adaptive Quizzes & Drills",
    subtitle: "Spaced repetition & concept mastery",
    description:
      "Reinforce theoretical fundamentals and architecture patterns with interactive bite-sized quizzes, timed drills, and progress benchmarks.",
    badge: "Mastery",
    iconName: "HelpCircle",
    highlights: [
      "Algorithmic benchmark drills",
      "Topic-specific milestone checks",
      "Adaptive difficulty scaling",
    ],
  },
]
