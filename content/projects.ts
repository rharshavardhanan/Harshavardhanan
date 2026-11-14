// Everything the site says about each project lives here: the work index, the
// chapters on the home page and the case-study pages all read from this file.
// To change a number or a sentence, change it here and it changes everywhere.
//
// Facts come from docs/brief.md and the résumé. Text marked `draft: true` was
// written for Harsha from those facts and shows a "draft" tag on the site
// until he confirms it; delete the line to remove the tag.

export type Slug =
  | "odovox"
  | "scp"
  | "aftermeet"
  | "road"
  | "kattral"
  | "cache"
  | "hallucination";

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
  /** What the live link is called on the page ("Live dashboard", "Live site"). */
  liveLabel?: string;
  /** Link to the code. */
  repo?: string;
  /** Who else built it, for team projects. */
  team?: string;
  /** "light" for a project whose colours are light (the header turns ink). */
  tone?: "light";
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
    slug: "scp",
    title: "Sequential Conformal Prediction",
    role: "Final-year project, with Akileshguhan A",
    year: "2026",
    tags: ["Robotics", "Conformal prediction", "Diffusion policy"],
    pitch:
      "Catching a robot arm that is failing a long task while it is still happening, with a guaranteed cap on false alarms.",
    stats: [
      {
        n: 7.1,
        decimals: 1,
        prefix: "+",
        suffix: " pts",
        label:
          "more failures caught than one global threshold, at the same false-alarm rate",
      },
      {
        n: 450,
        label: "rollouts of a frozen diffusion policy on three LIBERO tasks",
      },
      {
        n: 0.9,
        decimals: 2,
        label:
          "push-expert success on 200 fresh seeds after fine-tuning, up from 0.685",
      },
    ],
    stack: [
      "Python",
      "PyTorch",
      "LeRobot DiffusionPolicy",
      "LIBERO",
      "robosuite / MuJoCo",
      "panda-gym / PyBullet",
      "Stable-Baselines3 (TQC)",
    ],
    repo: "https://github.com/rharshavardhanan/sequential-conformal-prediction-for-long-robotic-tasks",
    team: "With Akileshguhan A · guided by Dr. Sankari M, VIT Chennai",
    problem:
      "A robot working through a long, multi-step task can be failing for hundreds of steps before anyone notices. Checking it at every step does not work either: test a 600-step episode 600 times and even a perfectly normal run raises an alarm almost every time.",
    built:
      "A monitor on the gap between what a frozen LeRobot diffusion policy planned and what the arm actually did, in LIBERO simulation. Conformal prediction is calibrated on the largest score of each normal rollout, so the false-alarm guarantee holds per rollout, not per step. Each stage (reach, grasp, carry, place, found from the gripper opening and closing) gets its own threshold. A second track uses the alarm to hand control from a cheap policy to an expert one on a reach-then-push task.",
    result:
      "Over 450 rollouts on three tasks, the stage-aware monitor catches more failures than one global threshold at every matched false-alarm rate from 0.10 up, on all three tasks: 7.1 points more at the working point (α 0.10). Handing control to the expert on an alarm lifts the cheap policy from 0.44 to 0.53 success while using the expert on only 13% of steps.",
    hard: "Two results went against the idea, and both are reported. Compared at the same α, the stage-aware monitor looks worse, by up to 27 points; that comparison is invalid, because the two monitors then run at different false-alarm rates, and the order flips once those are matched. And handing control over on an alarm did not beat handing it over at random moments with the same expert budget: 2.6 points better, a confidence interval that crosses zero, p = 0.24. The honest sample size is three tasks, and below a false-alarm rate of 0.10 the stage-aware monitor cannot run at all with the calibration data available.",
    flow: [
      "Frozen diffusion policy acts",
      "Planned vs executed tracking error",
      "Stage from the gripper opening and closing",
      "Per-stage conformal threshold",
      "Alarm, mid-episode",
      "Hand control to the expert",
    ],
  },
  {
    slug: "aftermeet",
    title: "Aftermeet",
    role: "Solo project",
    year: "2026",
    tags: ["Full-stack", "Speech-to-text", "LLM extraction"],
    pitch:
      "Turns a meeting into execution: drop in a recording or a transcript and get back the action items, decisions, risks, a follow-up email and formatted minutes.",
    stats: [
      {
        n: 3,
        label: "surfaces on one backend: web app, Chrome extension, Android",
      },
      {
        n: 3,
        label:
          "speech-to-text engines tried in turn for every five-minute chunk",
      },
      {
        text: "Solo",
        label:
          "design, backend, web app, extension and Android shell, Jun–Sep 2026",
      },
    ],
    stack: [
      "Next.js 15",
      "React 19",
      "NestJS 11",
      "PostgreSQL (Supabase)",
      "Prisma",
      "NextAuth (Google)",
      "Groq Whisper",
      "Gemini",
      "ffmpeg",
      "Stripe",
      "Chrome MV3",
      "Capacitor (Android)",
    ],
    live: "https://aftermeet-z1ey.vercel.app",
    liveLabel: "Live site",
    tone: "light",
    repo: "https://github.com/rharshavardhanan/Aftermeet",
    problem:
      "Meetings produce talk, and the work they decide gets lost between the call and the next morning. Most tools hand back a wall of transcript and call it done.",
    built:
      "One NestJS backend that owns every write and all the AI, behind three surfaces: a Next.js web app, a Chrome extension that captures Zoom and Google Meet tabs, and an Android shell. Audio is normalised and cut into five-minute chunks with ffmpeg, transcribed four at a time with Groq Whisper, falling back to Gemini and then OpenAI Whisper, stitched back in order and given speaker labels. A strict JSON schema, checked with Zod and retried on failure, turns the transcript into tasks with owners, dates, a confidence score and the exact quote each came from.",
    result:
      "A deployed product (web app on Vercel, backend on Render): Google sign-in, meeting history, tasks, exports to Markdown, PDF and Google Docs, Stripe checkout with plan limits, and a demo mode that runs the whole flow on a pasted transcript without any AI key.",
    hard: "Cookies do not cross origins, so the extension and the web app could not share a sign-in with the backend; the web app mints a five-minute signed token from the session instead, and the backend checks it. Long calls broke one-shot transcription, so audio is chunked, and a chunk that fails every engine twice becomes [unintelligible segment] instead of failing the whole transcript. And nothing is pinned to one language: a sentence that starts in Tamil and ends in English stays that way.",
    flow: [
      "Audio or a pasted transcript",
      "ffmpeg: mono 16 kHz, five-minute chunks",
      "Groq Whisper, then Gemini, then OpenAI Whisper",
      "Stitched in order, speaker labels added",
      "Strict-schema extraction, checked with Zod",
      "Tasks, decisions, email and minutes, saved together",
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
    liveLabel: "Live dashboard",
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
