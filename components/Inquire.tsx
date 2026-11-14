"use client";

import { useEffect, useRef } from "react";
import { ContactBody } from "./ContactBody";
import { lockPage } from "./Menu";

// INQUIRE, top right. It is a link to /contact, so it works with JavaScript
// off and can be shared; with JavaScript it opens the same contact sheet as a
// <dialog> over whatever page you are on. Escape or Close puts it away. The
// menu's own INQUIRE asks for it with an "inquire" event.
export function Inquire() {
  const dialog = useRef<HTMLDialogElement>(null);

  const open = () => {
    dialog.current?.showModal();
    lockPage(true);
  };

  useEffect(() => {
    window.addEventListener("inquire", open);
    return () => window.removeEventListener("inquire", open);
  }, []);

  return (
    <>
      <a
        href="/contact"
        aria-haspopup="dialog"
        data-no-wipe
        className="inline-block py-2"
        onClick={(event) => {
          event.preventDefault();
          open();
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
        onClose={() => lockPage(false)}
      >
        <div className="label flex items-center justify-between">
          <button
            type="button"
            className="min-h-11 py-2"
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
