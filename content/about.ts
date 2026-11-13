// The About section's words. Change them here.

// DRAFT: written for Harsha from the brief's facts. Replace with your own
// words, then set bioIsDraft to false to remove the "draft" tag on the page.
export const bio = [
  "I’m Harsha, a final-year engineering student at VIT Chennai and the founder of Odovox.",
  "I like problems where a model has to become a product someone can trust: the data and the training, the interface people actually touch, and the part most projects skip, measuring exactly how it fails.",
  "I’m looking for a full-time role from 2027.",
];
export const bioIsDraft = true;

export const spec = [
  ["Based in", "Chennai, India"],
  ["Studying", "B.Tech CSE (AI & Robotics), VIT Chennai, 2023–27"],
  ["Now", "Founder, Odovox"],
  ["Previously", "Software Developer, Zerofence"],
];

export const skills = [
  ["Languages", ["Python", "TypeScript", "JavaScript", "SQL", "Java"]],
  [
    "ML & CV",
    [
      "PyTorch",
      "YOLOv8",
      "scikit-learn",
      "LightGBM",
      "CatBoost",
      "XGBoost",
      "OpenCV",
      "Conformal prediction",
      "Reinforcement learning",
    ],
  ],
  ["GenAI", ["LLM APIs: OpenAI, Gemini, Ollama"]],
  [
    "Web & Backend",
    [
      "Next.js",
      "React",
      "FastAPI",
      "Fastify",
      "REST",
      "MongoDB",
      "PostgreSQL / Prisma",
      "Redis / BullMQ",
      "LiveKit",
      "Socket.IO",
    ],
  ],
  ["Tools", ["Git", "Docker", "Vercel", "Linux", "NVIDIA Jetson"]],
] as const;

export const wins = [
  "Makeathon Winner 2025 — VIT Chennai",
  "ML Certification 2025 — SmartBridge × Google",
];

export const contact = {
  email: "harshavardhananrajasimhan@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/rharshavardhanan" },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/harshavardhanan-rajasimhan",
    },
    { label: "Résumé", href: "/resume.pdf" },
  ],
};
