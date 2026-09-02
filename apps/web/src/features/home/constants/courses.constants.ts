export interface Course {
  id: string
  title: string
  slug: string
  category: "Full-Stack" | "AI & ML" | "Systems" | "DevOps"
  description: string
  level: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  lessonsCount: number
  projectsCount: number
  rating: number
  studentsCount: string
  tags: string[]
  highlight?: boolean
}

export const COURSE_CATEGORIES = [
  "All",
  "Full-Stack",
  "AI & ML",
  "Systems",
  "DevOps",
] as const

export const FEATURED_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Full-Stack Web Architecture & Scalable Systems",
    slug: "full-stack-web-architecture",
    category: "Full-Stack",
    description:
      "Master modern end-to-end web engineering. Build distributed microservices, realtime apps with WebSockets, and clean domain-driven backends.",
    level: "Intermediate",
    duration: "12 Weeks",
    lessonsCount: 64,
    projectsCount: 4,
    rating: 4.95,
    studentsCount: "1.4k+",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "Redis", "Docker"],
    highlight: true,
  },
  {
    id: "course-2",
    title: "Applied Generative AI & Autonomous LLM Agents",
    slug: "applied-generative-ai-agents",
    category: "AI & ML",
    description:
      "Design production-grade AI systems, multi-agent frameworks, semantic vector search pipelines, and custom tool-calling LLM workflows.",
    level: "Advanced",
    duration: "10 Weeks",
    lessonsCount: 48,
    projectsCount: 3,
    rating: 4.98,
    studentsCount: "980+",
    tags: ["Python", "PyTorch", "LangChain", "Vector DBs", "FastAPI", "OpenAI"],
    highlight: true,
  },
  {
    id: "course-3",
    title: "High-Performance Systems & Distributed Computing in Go",
    slug: "high-performance-systems-go",
    category: "Systems",
    description:
      "Deep dive into concurrency primitives, low-latency networking, memory optimization, and building distributed key-value stores from scratch.",
    level: "Advanced",
    duration: "8 Weeks",
    lessonsCount: 40,
    projectsCount: 3,
    rating: 4.92,
    studentsCount: "750+",
    tags: ["Go", "gRPC", "Concurrency", "Raft", "Distributed Systems", "Linux"],
  },
  {
    id: "course-4",
    title: "Cloud Infrastructure & Kubernetes for Production",
    slug: "cloud-infrastructure-kubernetes",
    category: "DevOps",
    description:
      "Architect resilient cloud infrastructure using Terraform, Kubernetes cluster orchestration, automated CI/CD pipelines, and Grafana telemetry.",
    level: "Intermediate",
    duration: "8 Weeks",
    lessonsCount: 38,
    projectsCount: 3,
    rating: 4.89,
    studentsCount: "620+",
    tags: ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD", "Prometheus"],
  },
]
