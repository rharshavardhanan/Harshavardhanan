// Everything the site says about each project lives here: the work index, the
// chapters on the home page and the case-study pages all read from this file.
// To change a number or a sentence, change it here and it changes everywhere.
//
// Facts come from docs/brief.md and the résumé. Text marked `draft: true` was
// written for Harsha from those facts and shows a "draft" tag on the site
// until he confirms it; delete the line to remove the tag.

export type Slug = "odovox" | "road" | "kattral" | "cache" | "hallucination";

/** One figure shown in a chapter. Give `n` to make it count up, or `text` to show it as is. */
export type Stat = {
  n?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  text?: string;
  label: string;
};

export type Project = {
  /** Short id: also the colour theme's name and the page address /work/<slug>. */
  slug: Slug;
  title: string;
  role: string;
  year?: string;
  tags: string[];
  pitch: string;
  stats: Stat[];
  stack: string[];
  live?: string;
  // Case-study page
  problem: string;
  built: string;
  result: string;
  hard: string;
  draft?: boolean;
  /** The steps of the architecture diagram, in order. */
  flow: string[];
};

export const projects: Project[] = [
  {
    slug: "odovox",
    title: "Odovox",
    role: "Founder",
    year: "2026",
    tags: ["Voice AI", "Healthcare", "Full-stack"],
    pitch:
      "A voice-first operating system for Indian dental clinics. Dentists speak, and Odovox turns it into clinical records, prescriptions, treatment plans, appointments, bills and WhatsApp follow‑ups. The doctor verifies every record before it’s saved.",
    stats: [
      { n: 8, label: "clinic modules, built end to end" },
      { n: 5, label: "steps from a spoken note to a verified record" },
      { text: "AES‑256", label: "GCM encryption on patient data" },
    ],
    stack: [
      "Next.js 15 PWA",
      "Fastify",
      "Socket.IO",
      "Prisma + PostgreSQL",
      "Redis + BullMQ",
      "S3",
      "Sarvam speech-to-text",
      "Gemini",
    ],
    problem:
      "A dentist works with both hands and writes up afterwards. Odovox lets them say it once, during the consultation, and turns that into every record the clinic needs.",
    built:
      "The full clinic workflow: sign-in and roles, voice consultation, a live patient queue, scheduling, lab, inventory, billing with GST and UPI/Razorpay, and WhatsApp follow-ups. A spoken note goes through Sarvam speech-to-text, Gemini extraction and a safety layer. Nothing is saved until the doctor has checked it; then it is committed in a single transaction.",
    result:
      "Eight modules working as one product. Patient data is encrypted with AES-256-GCM, sessions are signed with RS256 JWTs, access is role-based, each clinic’s data is isolated, and every change is written to an audit log. It is in active development.",
    hard: "In a chat app a transcription error is a typo. Here it would be the wrong tooth or the wrong dose in a medical record. So the model never writes to the record. Its output passes a safety layer, the doctor sees every field and confirms it, and only then is everything saved together, or not at all.",
    draft: true,
    flow: [
      "Browser recording",
      "S3",
      "Speech-to-text queue",
      "Extraction queue",
      "Live progress (SSE)",
      "Doctor verification",
      "Commit",
    ],
  },
  {
    slug: "road",
    title: "Automated Road Damage Survey",
    role: "Project",
    tags: ["Computer vision", "Calibration", "YOLOv8"],
    pitch:
      "Detecting potholes from dashcam video, and measuring exactly how the detector fails in a new region.",
    stats: [
      {
        n: 0.389,
        decimals: 3,
        label:
          "mAP50 in India after fine-tuning. It was 0.578 abroad and fell to 0.101 first",
      },
      {
        n: 10,
        suffix: " / 17",
        label: "potholes found on a scored 60-second clip, against 4",
      },
      {
        n: 8.3,
        decimals: 1,
        suffix: "%",
        label: "certified pothole miss rate, in-domain",
      },
    ],
    stack: ["Python", "PyTorch", "YOLOv8", "Split conformal prediction"],
    problem:
      "A pothole detector trained on one country’s roads is usually assumed to work on another’s. This project measured that assumption instead of making it.",
    built:
      "A YOLOv8s detector trained on the non-India part of RDD2022 and evaluated once on a held-out India split; a pothole-specialised variant; split conformal prediction to put a certified bound on the miss rate; and a budget-constrained repair optimiser over PCI-style 50 m segment scores.",
    result:
      "Fine-tuning on Indian data brought mAP50 back to 0.389. On a scored 60-second dashcam clip the pothole model found 10 of 17 potholes where the general model found 4. In-domain, the conformal bound certified a miss rate of 8.3%.",
    hard: "Three things broke, and each one is reported. Across regions, mAP50 fell from 0.578 to 0.101. A conformal bound calibrated out-of-domain promised 20% misses and delivered 73%: the guarantee only holds on data like the data it was calibrated on. And at a 10% budget the benefit-maximising repair schedule fixed 0.5% of the worst-condition roads, where plain worst-first fixed 39%. Optimising total benefit quietly abandons the worst roads.",
    flow: [
      "Dashcam video",
      "YOLOv8s detection",
      "Conformal calibration",
      "50 m segment scores",
      "Repair optimiser",
    ],
  },
  {
    slug: "kattral",
    title: "Kattral Academy",
    role: "Software Developer, Zerofence",
    year: "2026",
    tags: ["Real-time video", "WebRTC", "Full-stack"],
    pitch:
      "A live-classroom platform. Teachers create classes; students join with a code for real-time video, screen sharing and chat.",
    stats: [
      {
        text: "Full stack",
        label: "front end, API, data and video, owned by one developer",
      },
      { n: 3, label: "ways to be in class: video, screen share and chat" },
      { text: "May–Jul 2026", label: "at Zerofence, Chennai" },
    ],
    stack: [
      "Next.js 16",
      "React 19",
      "REST API",
      "MongoDB",
      "LiveKit (WebRTC)",
      "NextAuth Google OAuth",
      "JWT",
      "Docker",
    ],
    problem:
      "A class is more than a video call. It needs classrooms that persist, sessions inside them, and a simple way for students to get in.",
    built:
      "Teachers create classrooms and sessions; students join by invite code for real-time video, screen sharing and chat. A Next.js 16 and React 19 front end, a REST API, a MongoDB data layer, LiveKit (WebRTC) for video, sign-in with NextAuth Google OAuth and backend-issued JWTs, and Docker for the services.",
    result:
      "A working live-classroom platform, built in three months at Zerofence, with the whole stack owned by one developer.",
    hard: "Two systems have to agree on who someone is. NextAuth signs the user in with Google in the browser, while the API and the video rooms trust only tokens the backend issues. Getting from one to the other on every request and every room join is the part that needs the most care.",
    draft: true,
    flow: [
      "Browser (Next.js)",
      "Google sign-in (NextAuth)",
      "Backend JWT",
      "REST API + MongoDB",
      "LiveKit room",
    ],
  },
  {
    slug: "cache",
    title: "Edge Cache RL",
    role: "Project",
    tags: ["Reinforcement learning", "Systems", "FastAPI"],
    pitch: "Teaching a cache what to forget, using reinforcement learning.",
    stats: [
      { text: "+10–15%", label: "hit rate over LRU and LFU" },
      {
        n: 2,
        label: "agents written from scratch: Q-Learning and adaptive RL",
      },
      { text: "Live", label: "dashboard for running and comparing policies" },
    ],
    stack: ["Python", "Q-Learning", "FastAPI", "React"],
    live: "https://rlcachemanagement-grq86hhh3.vercel.app",
    problem:
      "A cache has to decide what to throw away. LRU and LFU each follow one fixed rule, and each is wrong for some kinds of traffic.",
    built:
      "Q-Learning and adaptive RL cache-replacement agents written from scratch, served through a FastAPI backend, with a React dashboard for running and comparing policies live.",
    result:
      "The agents beat LRU and LFU baselines by 10–15% hit rate. The service is deployed and the dashboard is public.",
    hard: "A cache gives its feedback late: throwing an item away only turns out to be a mistake when that item is asked for again. Turning that delayed signal into a reward an agent can learn from is the centre of the problem.",
    draft: true,
    flow: [
      "Request",
      "Cache lookup",
      "Agent picks what to evict",
      "Hit or miss becomes reward",
      "Q-table update",
    ],
  },
  {
    slug: "hallucination",
    title: "Hallucination Detection in LLMs",
    role: "Project",
    tags: ["NLP", "Classification", "LLM evaluation"],
    pitch: "Catching AI answers that aren’t supported by the facts.",
    stats: [
      { n: 25000, suffix: "+", label: "labelled samples" },
      { n: 94, suffix: "%", label: "accuracy" },
      { n: 82.5, decimals: 1, suffix: "%", label: "ROC-AUC" },
    ],
    stack: ["Python", "LightGBM", "CatBoost", "SMOTE"],
    problem:
      "A language model states something false in exactly the tone it uses for something true. The question was whether unsupported answers can be caught from features you can measure.",
    built:
      "Unsupported output framed as supervised classification over 25,000+ samples, with an engineered feature set, SMOTE for class imbalance, and a LightGBM and CatBoost ensemble.",
    result:
      "94% accuracy and 82.5% ROC-AUC, evaluated with per-class metrics, ROC and PR curves, and feature-group ablations.",
    hard: "The two headline numbers disagree, and the gap is the finding. With imbalanced classes, part of 94% accuracy is simply the majority class. 82.5% ROC-AUC is the more honest measure of how well the model separates supported answers from unsupported ones, which is why the evaluation reports per-class metrics and not accuracy alone.",
    draft: true,
    flow: [
      "25,000+ samples",
      "Feature engineering",
      "SMOTE",
      "LightGBM + CatBoost",
      "Ensemble verdict",
    ],
  },
];

export const project = (slug: string) =>
  projects.find((item) => item.slug === slug);
