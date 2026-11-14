"use client";

import { useRef } from "react";
import { ContactBody } from "./ContactBody";

// INQUIRE, top right. It is a link to /contact, so it works with JavaScript
// off and can be shared; with JavaScript it opens the same contact sheet as a
// <dialog> over whatever page you are on. Escape or Close puts it away.
export function Inquire() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <a
        href="/contact"
        aria-haspopup="dialog"
        data-no-wipe
        className="inline-block py-2"
        onClick={(event) => {
          event.preventDefault();
          dialog.current?.showModal();
        }}
      >
        Inquire
      </a>

      <dialog
        ref={dialog}
        aria-label="Inquire"
        className="menu"
        data-theme="neutral"
        data-lenis-prevent
      >
        <div className="label flex items-center justify-between">
          <button
            type="button"
            className="py-2"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <ContactBody />
      </dialog>
    </>
  );
}
