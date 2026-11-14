import type { Metadata } from "next";
import { ContactBody } from "@/components/ContactBody";

// The contact sheet as a page of its own. INQUIRE links here, so it works
// with JavaScript off and can be shared; with JavaScript, INQUIRE opens the
// same sheet in a dialog instead (components/Inquire.tsx).
export const metadata: Metadata = {
  title: "Inquire",
  description:
    "Write to Harshavardhanan: email, GitHub, LinkedIn and résumé.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="px-gutter min-h-svh pt-20 pb-24">
      <h1 className="sr-only">Inquire</h1>
      <ContactBody />
    </div>
  );
}
