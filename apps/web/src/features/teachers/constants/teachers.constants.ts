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
    "Join elite engineers, technical architects, and educators building structured video courses, hosting live interactive classrooms, and scaling creator academies on Coursity.",
  primaryCta: "Apply as Teacher",
  primaryCtaHref: "/teachers/signup",
  secondaryCta: "View Plans & Pricing",
  secondaryCtaHref: "#pricing",
}

export const TEACHER_STATS: TeacherOpportunity[] = [
  {
    id: "stat-1",
    title: "Industry Leading Payouts",
    description: "Keep up to 85% of student enrollments with zero hidden hosting, transcoding, or bandwidth fees.",
    metric: "85%",
    metricLabel: "Creator Revenue Share",
  },
  {
    id: "stat-2",
    title: "Recurring Instructor Income",
    description: "Top engineering educators earn substantial recurring monthly income through course sales and live cohort workshops.",
    metric: "₹1,50,000+",
    metricLabel: "Top Monthly Earnings",
  },
  {
    id: "stat-3",
    title: "AI Quality Vetting",
    description: "Our conversational AI voice interviewer evaluates instructors on technical clarity, pedagogy, and communication in minutes.",
    metric: "4-Stage",
    metricLabel: "Fast-Track Onboarding",
  },
  {
    id: "stat-4",
    title: "Automated Cloud Storage",
    description: "Every live broadcast is automatically archived to high-speed cloud storage for asynchronous student playback.",
    metric: "100%",
    metricLabel: "Automated Cloud Archive",
  },
]

export const TEACHER_FEATURES_HEADER = {
  badge: "Creator Studio Tooling",
  titleMain: "Everything You Need to",
  titleHighlight: "Teach, Stream & Scale",
  subtitle:
    "We handle HD video streaming, cloud recording archives, automated AI assessments, and Razorpay payouts so you can focus 100% on teaching.",
}

export const TEACHER_FEATURES: TeacherFeature[] = [
  {
    id: "feat-1",
    badge: "Live Studio",
    title: "HD Live Classroom Streaming",
    description:
      "Broadcast low-latency interactive workshops and pair programming sessions to hundreds of concurrent students with live chat and automatic cloud recording.",
  },
  {
    id: "feat-2",
    badge: "AI Vetting",
    title: "Real-Time AI Voice Vetting",
    description:
      "Get qualified in minutes through our conversational AI interview engine evaluating pedagogy, technical depth, and communication skills.",
  },
  {
    id: "feat-3",
    badge: "Curriculum",
    title: "Modular Course & Video Studio",
    description:
      "Easily organize lessons into modules, upload high-bitrate video lessons, manage draft-to-published states, and track student completion.",
  },
  {
    id: "feat-4",
    badge: "Tier Quotas",
    title: "Flexible Quotas & Storage Limits",
    description:
      "Start free on the Starter Tier, or scale with Pro and Enterprise plans offering massive live streaming minutes, high viewer capacities, and cloud storage.",
  },
  {
    id: "feat-5",
    badge: "Analytics",
    title: "Granular Learner Telemetry",
    description:
      "Track student retention, module completion rates, and real-time live attendance metrics across all your active courses.",
  },
  {
    id: "feat-6",
    badge: "Payments",
    title: "Razorpay & GST Compliant Payouts",
    description:
      "Receive transparent payouts via Razorpay with automated 18% GST tax invoices and comprehensive billing history.",
  },
]

export const TEACHER_STEPS_HEADER = {
  title: "How Instructor Onboarding Works",
  subtitle: "From registration to your first live class in three streamlined steps.",
}

export const TEACHER_STEPS: StepItem[] = [
  {
    step: "01",
    title: "Create Profile & Apply",
    description: "Sign up as an instructor, submit your professional background, bio, experience, and domain specializations.",
  },
  {
    step: "02",
    title: "AI Voice Vetting Interview",
    description: "Complete a 5-minute interactive voice interview with our AI evaluator testing your technical clarity and teaching methodology.",
  },
  {
    step: "03",
    title: "Unlock Studio, Stream & Earn",
    description: "Access your Creator Studio, build modular courses, host live stream classrooms, and keep up to 85% revenue from enrollments.",
  },
]

