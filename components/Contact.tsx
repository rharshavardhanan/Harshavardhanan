"use client";

import { useRef, useState } from "react";
import { contact } from "@/content/about";
import { ArrowUpRight } from "./ArrowUpRight";

// The email address, very large. Clicking it copies it and says so; the small
// link beside it opens the mail app instead. (With JavaScript off, the big
// address is an ordinary mail link.)
function Email() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
    } catch {
      // Clipboard blocked: open the mail app instead, as a plain link would.
      window.open(`mailto:${contact.email}`, "_self");
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2400);
  };

  return (
    // @container lets the address size itself to fit its row exactly.
    <div className="relative @container">
      <a
        href={`mailto:${contact.email}`}
        onClick={(event) => {
          // Stop the link opening the mail app, then copy instead.
          event.preventDefault();
          void copy();
        }}
        data-cursor="Copy"
        className="email-fit block font-serif no-underline"
        aria-describedby="email-hint"
      >
        {contact.email}
      </a>
      <p
        id="email-hint"
        className="label text-muted mt-4 flex flex-wrap gap-x-8 gap-y-2"
      >
        <span>Click to copy</span>
        <a href={`mailto:${contact.email}`} className="text-fg">
          Open your mail app
          <ArrowUpRight />
        </a>
      </p>
      <p
        role="status"
        className="label text-bg bg-fg pointer-events-none absolute -top-10 left-0 px-3 py-2 transition-opacity duration-300 data-[on=false]:opacity-0"
        data-on={copied}
      >
        {copied ? "copied ✓" : ""}
      </p>
    </div>
  );
}

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

  // Fields are just a line to write on, in large type.
  const field =
    "text-h3 mt-2 block w-full border-0 border-b border-line bg-transparent pb-3 font-serif outline-none transition-colors focus:border-fg focus-visible:outline-none placeholder:text-muted";

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="px-gutter grid grid-cols-12 gap-x-4 gap-y-20 pt-48 pb-40"
    >
      <div className="col-span-12">
        <h2 id="contact-title" data-lines className="text-h2 max-w-[14ch]">
          Have a hard problem? <em>Let’s build it.</em>
        </h2>
      </div>

      <div className="col-span-12">
        <Email />
      </div>

      <div className="col-span-12 lg:col-span-5">
        <ul className="label flex flex-wrap gap-x-10 gap-y-3">
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
        className="col-span-12 space-y-10 lg:col-span-5 lg:col-start-8"
      >
        <label className="label block">
          Name
          <input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="label block">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
          />
        </label>
        <label className="label block">
          Message
          <textarea
            name="message"
            required
            rows={3}
            className={`${field} resize-none`}
          />
        </label>
        <button type="submit" className="btn label">
          Send
          <ArrowUpRight className="rotate-45" />
        </button>
        <p role="status" className="label min-h-[3lh]">
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
