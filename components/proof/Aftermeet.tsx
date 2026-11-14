import { media } from "@/lib/media";
import { Frame } from "../Frame";
import { MediaView } from "../MediaView";

// The live site in a browser, the workspace, the phone and the extension.
// Two of these are illustrations taken from the landing page, and say so.
export function AftermeetProof() {
  return (
    <>
      <div className="mx-auto max-w-5xl">
        <Frame kind="browser" tilt cursor="View">
          <MediaView
            media={media("aftermeet-landing.png", "aftermeet")}
            alt="Aftermeet’s landing page: Turn meetings into execution"
            sizes="(min-width: 1024px) 64rem, 100vw"
            position="object-top"
            className="absolute inset-0"
          />
        </Frame>
        <p className="label text-muted mt-5">The live site</p>
      </div>

      <div data-cursor="View">
        <MediaView
          media={media("aftermeet-workspace.png", "aftermeet")}
          alt="Aftermeet’s workspace: the transcript, the AI output and the tasks side by side"
          sizes="100vw"
          className="aspect-[1600/576] rounded-xl"
        />
        <p className="label text-muted mt-5">
          One meeting, laid out: transcript, output, tasks. (Illustration from
          the landing page.)
        </p>
      </div>

      <div className="grid items-end gap-x-10 gap-y-16 sm:grid-cols-[2fr_3fr]">
        <div>
          <Frame kind="phone" cursor="View">
            <MediaView
              media={media("aftermeet-mobile.png", "aftermeet")}
              alt="Aftermeet on a phone"
              sizes="20rem"
              inPhone
              className="absolute inset-0"
            />
          </Frame>
          <p className="label text-muted mt-5">
            On a phone (the Android shell loads the same app)
          </p>
        </div>
        <div data-cursor="View">
          <MediaView
            media={media("aftermeet-extension.png", "aftermeet")}
            alt="Aftermeet’s Chrome extension panel in a Google Meet call, writing live tasks"
            sizes="(min-width: 640px) 55vw, 100vw"
            className="aspect-[800/520] rounded-xl"
          />
          <p className="label text-muted mt-5">
            The Chrome extension, inside a call. (Illustration from the
            landing page.)
          </p>
        </div>
      </div>
    </>
  );
}
