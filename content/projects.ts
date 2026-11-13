// The five projects, in the order they appear on the site.
// `slug` is a project's short id. It is also the name of its colour theme in
// app/globals.css and, later, its address: /work/<slug>.
export type Project = {
  slug: "odovox" | "road" | "kattral" | "cache" | "hallucination";
  title: string;
  role?: string;
  pitch: string;
};

export const projects: Project[] = [
  {
    slug: "odovox",
    title: "Odovox",
    role: "Founder",
    pitch:
      "A voice-first operating system for Indian dental clinics. Dentists speak, and Odovox turns it into clinical records, prescriptions, treatment plans, appointments, bills and WhatsApp follow-ups. The doctor verifies every record before it’s saved.",
  },
  {
    slug: "road",
    title: "Automated Road Damage Survey",
    pitch:
      "Detecting potholes from dashcam video, and measuring exactly how the detector fails in a new region.",
  },
  {
    slug: "kattral",
    title: "Kattral Academy",
    role: "Software Developer, Zerofence",
    pitch:
      "A live-classroom platform. Teachers create classes; students join with a code for real-time video, screen sharing and chat.",
  },
  {
    slug: "cache",
    title: "Edge Cache RL",
    pitch: "Teaching a cache what to forget, using reinforcement learning.",
  },
  {
    slug: "hallucination",
    title: "Hallucination Detection in LLMs",
    pitch: "Catching AI answers that aren’t supported by the facts.",
  },
];
