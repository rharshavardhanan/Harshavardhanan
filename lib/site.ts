// The site's public address, used for links that must be absolute (link
// previews, the sitemap). Set NEXT_PUBLIC_SITE_URL to the real domain, for
// example https://harsha.dev, in Vercel's settings or a .env file. Until
// then: on Vercel the project's own address is used, elsewhere localhost.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Harshavardhanan";
export const SITE_DESCRIPTION =
  "Portfolio of Harshavardhanan Rajasimhan, software engineer and founder in Chennai. He builds AI products end to end: Odovox, road-damage detection, live classrooms, RL caching and hallucination detection.";

// A description of Harsha in the format search engines read (schema.org).
export const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Harshavardhanan Rajasimhan",
  alternateName: "Harsha",
  url: SITE_URL,
  image: `${SITE_URL}/media/og.png`,
  jobTitle: "Software engineer and founder",
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chennai",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Vellore Institute of Technology, Chennai",
  },
  worksFor: { "@type": "Organization", name: "Odovox" },
  knowsAbout: [
    "Machine learning",
    "Computer vision",
    "Reinforcement learning",
    "Full-stack web development",
  ],
  sameAs: [
    "https://github.com/rharshavardhanan",
    "https://linkedin.com/in/harshavardhanan-rajasimhan",
  ],
};
