export interface NavCalloutConfig {
  title: string
  badge?: string
  description: string
  ctaText: string
  ctaHref: string
  dismissText: string
  storageKey: string
}

export interface NavLink {
  label: string
  href: string
  callout?: NavCalloutConfig
}

export const TEACHER_CALLOUT: NavCalloutConfig = {
  title: "Teach on Coursity",
  badge: "85% Share",
  description:
    "Join our instructor network. Host live classroom streams, publish modular curriculums, and earn up to 85% revenue share with automated GST payouts.",
  ctaText: "Teach on Coursity",
  ctaHref: "/teachers",
  dismissText: "Got it",
  storageKey: "coursity_teacher_callout_dismissed",
}

export const STUDENT_CALLOUT: NavCalloutConfig = {
  title: "Learn on Coursity",
  badge: "Engineering",
  description:
    "Master full-stack, AI agents, and systems engineering with production video tracks, live streaming classrooms, and AI voice interview practice.",
  ctaText: "Explore Courses",
  ctaHref: "/courses",
  dismissText: "Got it",
  storageKey: "coursity_student_callout_dismissed",
}

// Default navigation links for students / main site
export const NAV_LINKS: NavLink[] = [
  {
    label: "Courses",
    href: "/courses",
  },
  {
    label: "For Teachers",
    href: "/teachers",
    callout: TEACHER_CALLOUT,
  },
  {
    label: "Get Started",
    href: "/signup",
  },
]

// Navigation links when viewing the Teachers page
export const TEACHER_NAV_LINKS: NavLink[] = [
  {
    label: "For Students",
    href: "/",
    callout: STUDENT_CALLOUT,
  },
]
