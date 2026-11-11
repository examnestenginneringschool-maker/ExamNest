export type LegalDocKey =
  | "terms"
  | "privacy"
  | "refund-policy"
  | "shipping-delivery"
  | "academic-disclaimer"
  | "copyright-policy"
  | "fair-usage"
  | "about"
  | "contact";

export interface PolicyNavItem {
  key: LegalDocKey;
  label: string;
  shortLabel: string;
  href: string;
  description: string;
}

export interface PolicyBranch {
  id: "legal" | "safety" | "company";
  label: string;
  items: PolicyNavItem[];
}

export const PLATFORM_INFO = {
  name: "ExamNest",
  tagline: "The Engineering School",
  domain: "examnestcollege.vercel.app",
  url: "https://examnestcollege.vercel.app",
  lastUpdated: "November, 2026",
  phoneDisplay: "+91-87092 87648",
  phoneHref: "tel:+918709287648",
  operatingHours: "Monday – Saturday | 10:00 AM – 7:00 PM IST",
  averageResponseTime: "Within 2 to 6 business hours",
  address: {
    street: "Panchpota, Police Para",
    city: "Garia, Kolkata",
    district: "South 24 Parganas",
    state: "West Bengal",
    pinCode: "700152",
    country: "India",
    full: "Panchpota, Police Para, Garia, Kolkata, South 24 Parganas, West Bengal – 700152, India",
  },
  emails: {
    support: "support@examnestcollege.vercel.app",
    privacy: "privacy@examnestcollege.vercel.app",
    terms: "terms@examnestcollege.vercel.app",
    legal: "legal@examnestcollege.vercel.app",
    grievance: "grievance@examnestcollege.vercel.app",
  },
} as const;

export const POLICY_BRANCHES: PolicyBranch[] = [
  {
    id: "legal",
    label: "Legal & Compliance",
    items: [
      {
        key: "terms",
        label: "Terms & Conditions",
        shortLabel: "Terms & Conditions",
        href: "/terms",
        description: "Platform usage guidelines, licensing & user rules",
      },
      {
        key: "privacy",
        label: "Student Privacy Policy",
        shortLabel: "Student Privacy",
        href: "/privacy",
        description: "Data stewardship, security & payment privacy",
      },
      {
        key: "refund-policy",
        label: "Refund & Cancellation Policy",
        shortLabel: "Refund & Cancellation",
        href: "/refund-policy",
        description: "Strict no-refund rules & batch replacement",
      },
      {
        key: "shipping-delivery",
        label: "Shipping & Delivery Policy",
        shortLabel: "Shipping & Delivery",
        href: "/shipping-delivery",
        description: "Instant digital access & delivery support",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & Integrity",
    items: [
      {
        key: "academic-disclaimer",
        label: "Academic Disclaimer",
        shortLabel: "Academic Disclaimer",
        href: "/academic-disclaimer",
        description: "Non-affiliation notice & academic score scope",
      },
      {
        key: "copyright-policy",
        label: "Copyright & IP Policy",
        shortLabel: "Copyright & IP",
        href: "/copyright-policy",
        description: "Content ownership, watermarking & enforcement",
      },
      {
        key: "fair-usage",
        label: "Fair Usage Policy",
        shortLabel: "Fair Usage",
        href: "/fair-usage",
        description: "Single-user license, sessions & anti-piracy",
      },
    ],
  },
  {
    id: "company",
    label: "Company & Support",
    items: [
      {
        key: "about",
        label: "About Us",
        shortLabel: "About Us",
        href: "/about",
        description: "ExamNest mission, architecture & curriculum story",
      },
      {
        key: "contact",
        label: "Contact Us & Grievance Redressal",
        shortLabel: "Contact & Grievance",
        href: "/contact",
        description: "Student helpline, address & grievance officer",
      },
    ],
  },
];
