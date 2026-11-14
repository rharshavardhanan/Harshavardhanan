import type { Metadata } from "next";
import { About } from "@/components/About";
import { Motion } from "@/components/Motion";

// Who Harsha is, on a page of its own (the words are in content/about.ts).
export const metadata: Metadata = {
  title: "About",
  description:
    "Harshavardhanan Rajasimhan: software engineer and founder in Chennai, building AI products end to end.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <About />
      <Motion />
    </>
  );
}
