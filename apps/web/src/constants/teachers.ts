export interface TeacherOpportunity {
  id: string
  title: string
  description: string
  metric: string
  metricLabel: string
}

export interface TeacherFeature {
  id: string
  title: string
  description: string
  badge: string
}

export interface StepItem {
  step: string
  title: string
  description: string
}

export const TEACHER_HERO = {
  titleMain: "Teach What You Build.",
  titleHighlight: "Earn Up to 85% Revenue.",
  subtitle:
    "Join world-class engineers, tech leads, and educators building interactive courses, live cohorts, and AI-evaluated labs on Coursity.",
  primaryCta: "Create Teacher Account",
  primaryCtaHref: "#signup",
  secondaryCta: "Explore Features",
  secondaryCtaHref: "#features",
}

export const TEACHER_STATS: TeacherOpportunity[] = [
  {
    id: "stat-1",
    title: "Industry Leading Payouts",
    description: "Keep up to 85% of student enrollments with zero hidden hosting or platform fees.",
    metric: "85%",
    metricLabel: "Creator Revenue Share",
  },
  {
    id: "stat-2",
    title: "Average Teacher Earnings",
    description: "Top teachers earn substantial recurring monthly income through live cohorts and tracks.",
    metric: "$8,500+",
    metricLabel: "Avg. Monthly Earnings",
  },
  {
    id: "stat-3",
    title: "High Completion Rate",
    description: "Interactive browser labs and AI assessments keep students 3x more engaged than video-only courses.",
    metric: "94%",
    metricLabel: "Student Completion",
  },
  {
    id: "stat-4",
    title: "Global Builder Community",
    description: "Instantly distribute your courses to ambitious developers across 40+ countries.",
    metric: "50,000+",
    metricLabel: "Active Learners",
  },
]

export const TEACHER_FEATURES_HEADER = {
  badge: "Creator Tooling",
  titleMain: "Everything You Need to",
  titleHighlight: "Ship & Scale",
  subtitle:
    "We handle hosting, cloud sandboxes, automated grading, and payment processing so you can focus 100% on teaching.",
}

export const TEACHER_FEATURES: TeacherFeature[] = [
  {
    id: "feat-1",
    badge: "Automation",
    title: "Automated AI Code Grading",
    description:
      "Save 20+ hours weekly. Our automated sandboxes run test suites, check complexity, and give personalized instant feedback to students.",
  },
  {
    id: "feat-2",
    badge: "Live Cohorts",
    title: "Built-In Live Studio & Sprints",
    description:
      "Host live interactive coding workshops, pair programming sessions, and screen-shares directly in the browser with zero external Zoom links.",
  },
  {
    id: "feat-3",
    badge: "Interactive Labs",
    title: "Instant Cloud Development Sandboxes",
    description:
      "Provision full Linux containers with Node, Python, Go, and Docker in seconds so students never struggle with local environment setup.",
  },
  {
    id: "feat-4",
    badge: "Marketing & Growth",
    title: "Built-in Audience & Distribution",
    description:
      "We feature your curriculum across our newsletter, discord community, and engineering partner network to drive immediate student enrollments.",
  },
  {
    id: "feat-5",
    badge: "Analytics",
    title: "Granular Learner Analytics",
    description:
      "Identify exactly where students get stuck, track quiz performance drop-offs, and continuously optimize your curriculum with actionable telemetry.",
  },
  {
    id: "feat-6",
    badge: "Payments",
    title: "Instant Global Stripe Payouts",
    description:
      "Receive direct, transparent weekly or monthly payouts via Stripe Connect in your local currency across 120+ countries.",
  },
]

export const TEACHER_STEPS_HEADER = {
  title: "How It Works",
  subtitle: "From registration to launch in three frictionless steps.",
}

export const TEACHER_STEPS: StepItem[] = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up in 30 seconds and access your teacher dashboard and course studio.",
  },
  {
    step: "02",
    title: "Build with AI Studio",
    description: "Use our AI curriculum builder and interactive code sandboxes to craft engaging lessons.",
  },
  {
    step: "03",
    title: "Launch & Get Paid",
    description: "Publish your course to thousands of learners and start earning 85% revenue share from day one.",
  },
]