import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/ArrowUpRight";

export const metadata: Metadata = { title: "404" };

// Shown for any address that does not exist.
export default function NotFound() {
  return (
    <section className="px-gutter grid min-h-[70svh] content-center">
      <h1 className="text-display font-serif">404</h1>
      <p className="text-lead mt-4">This page is out of distribution.</p>
      <p className="mt-10">
        <Link href="/" className="btn">
          Back to the start
          <ArrowUpRight className="rotate-45" />
        </Link>
      </p>
    </section>
  );
}
