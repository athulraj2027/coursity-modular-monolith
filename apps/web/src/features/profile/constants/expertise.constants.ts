export interface ExpertiseCategory {
  id: string
  name: string
  tags: readonly string[]
}

export const EXPERTISE_CATEGORIES: ExpertiseCategory[] = [
  {
    id: "software-dev",
    name: "Software & Web Development",
    tags: [
      "Web Development",
      "Frontend Development",
      "Backend Development",
      "Full Stack Development",
      "Mobile App Development",
      "JavaScript / TypeScript",
      "Python",
      "Java",
      "Go",
      "Rust",
      "C / C++",
    ],
  },
  {
    id: "cloud-systems",
    name: "Cloud, Systems & Architecture",
    tags: [
      "Cloud Computing",
      "Cloud Native",
      "DevOps",
      "Kubernetes",
      "Docker & Containers",
      "Distributed Systems",
      "Distributed Algorithms",
      "System Design",
      "Software Architecture",
      "Systems Architecture",
      "Linux & Systems",
      "Microservices",
    ],
  },
  {
    id: "ai-data",
    name: "Data Science & AI",
    tags: [
      "Data Science",
      "Machine Learning",
      "Artificial Intelligence",
      "Deep Learning",
      "Data Analytics",
      "Big Data Engineering",
      "Natural Language Processing",
      "Computer Vision",
    ],
  },
  {
    id: "databases",
    name: "Databases & Storage",
    tags: [
      "Database Engineering",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "SQL & Query Optimization",
    ],
  },
  {
    id: "security-blockchain",
    name: "Security & Blockchain",
    tags: [
      "Cybersecurity",
      "Ethical Hacking",
      "Network Engineering",
      "Cryptography",
      "Blockchain & Web3",
    ],
  },
  {
    id: "design-product",
    name: "Design & Product",
    tags: [
      "UI/UX Design",
      "Product Management",
      "Graphic Design",
      "Design Systems",
    ],
  },
  {
    id: "cs-quality",
    name: "Computer Science & Testing",
    tags: [
      "Algorithms & Data Structures",
      "Quality Assurance & Testing",
      "CI/CD & Automation",
      "Game Development",
      "Embedded Systems & IoT",
    ],
  },
]

export const ALL_EXPERTISE_TAGS: string[] = EXPERTISE_CATEGORIES.flatMap((c) => c.tags)
