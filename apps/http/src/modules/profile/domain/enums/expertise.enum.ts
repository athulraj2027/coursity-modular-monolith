export const EXPERTISE_DOMAINS = [
    // Web & Software Development
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

    // Systems & Cloud
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

    // Data, AI & Machine Learning
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "Deep Learning",
    "Data Analytics",
    "Big Data Engineering",
    "Natural Language Processing",
    "Computer Vision",

    // Databases & Storage
    "Database Engineering",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQL & Query Optimization",

    // Security & Infrastructure
    "Cybersecurity",
    "Ethical Hacking",
    "Network Engineering",
    "Cryptography",
    "Blockchain & Web3",

    // Design & Product
    "UI/UX Design",
    "Product Management",
    "Graphic Design",
    "Design Systems",

    // Computer Science & Quality
    "Algorithms & Data Structures",
    "Quality Assurance & Testing",
    "CI/CD & Automation",
    "Game Development",
    "Embedded Systems & IoT",
] as const;

export type ExpertiseDomain = (typeof EXPERTISE_DOMAINS)[number];
