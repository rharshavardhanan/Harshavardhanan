"use client";

import { useState } from "react";
import { contact } from "@/content/about";
import { ArrowUpRight } from "./ArrowUpRight";

// There is no mail server behind this form. Sending it opens the visitor's
// own mail app with the message already written, addressed to Harsha. With
// JavaScript off the browser does much the same on its own, because the form's
// action is a mailto: address.
export function Contact() {
  const [mailto, setMailto] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name"));
    const body = `${data.get("message")}\n\n${name}\n${data.get("email")}`;
    const url = `mailto:${contact.email}?subject=${encodeURIComponent(
      `Portfolio: message from ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    setMailto(url);
    // Opens the mail app. (window.open, so the automated tests can switch
    // this one line off and not open a real mail window on the machine.)
    window.open(url, "_self");
  };

  const field =
    "border-line bg-bg placeholder:text-muted focus:border-fg mt-1 block w-full border px-3 py-3 outline-none focus-visible:outline-2";

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="px-gutter grid grid-cols-12 gap-x-4 gap-y-12 pt-40 pb-32"
    >
      <div className="col-span-12 lg:col-span-6">
        <h2 id="contact-title" data-reveal className="text-title max-w-[14ch]">
          Have a hard problem? <em>Let’s build it.</em>
        </h2>
        <ul className="text-label mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono">
          <li>
            <a href={`mailto:${contact.email}`} className="inline-block py-2">
              {contact.email}
            </a>
          </li>
          {contact.links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="inline-block py-2">
                {link.label}
                <ArrowUpRight />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <form
        action={`mailto:${contact.email}`}
        method="post"
        encType="text/plain"
        onSubmit={onSubmit}
        data-mailto={mailto}
        className="col-span-12 lg:col-span-5 lg:col-start-8"
      >
        <label className="text-label block font-mono">
          Name
          <input
            name="name"
            required
            autoComplete="name"
            className={`text-body font-sans ${field}`}
          />
        </label>
        <label className="text-label mt-5 block font-mono">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`text-body font-sans ${field}`}
          />
        </label>
        <label className="text-label mt-5 block font-mono">
          Message
          <textarea
            name="message"
            required
            rows={5}
            className={`text-body font-sans ${field}`}
          />
        </label>
        <button type="submit" className="btn mt-6">
          Send
          <ArrowUpRight className="rotate-45" />
        </button>
        <p role="status" className="text-label mt-4 min-h-[3lh] font-mono">
          {mailto && (
            <>
              message handed to your mail app · reply in &lt; 24h once it’s
              sent. Nothing opened?{" "}
              <a href={mailto} className="underline">
                Open it again
              </a>
              .
            </>
          )}
        </p>
      </form>
    </section>
  );
}
