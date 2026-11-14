import Image from "next/image";
import type { Media } from "@/lib/media";
import { LazyVideo } from "./LazyVideo";

// Shows one picture or recording, filling its box. While the real file is
// missing it shows the particle cover and says so in a small label. Pass
// `inPhone` when the caller has drawn a phone around it (the picture is then
// kept from the top).
export function MediaView({
  media,
  alt,
  sizes,
  priority = false,
  inPhone = false,
  position = "",
  ratio,
  className = "",
}: {
  media: Media;
  alt: string;
  sizes: string;
  priority?: boolean;
  inPhone?: boolean;
  /** Which part of the picture to keep when it is cropped, e.g. "object-left". */
  position?: string;
  /** Width divided by height, when the box should take the picture's own shape. */
  ratio?: number;
  className?: string;
}) {
  // Positioned "relative" unless the caller already positions it (absolute).
  const box = `overflow-hidden ${/\babsolute\b/.test(className) ? "" : "relative"} ${className}`;

  const shape = ratio ? { aspectRatio: String(ratio) } : undefined;

  return (
    <div className={box} style={shape}>
      {media.video ? (
        <LazyVideo
          src={media.src}
          label={alt}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <Image
          src={media.src}
          alt={media.placeholder ? "" : alt}
          fill
          sizes={sizes}
          // The covers are already small; real screenshots get optimised.
          unoptimized={media.placeholder}
          preload={priority}
          className={`object-cover ${inPhone ? "object-top" : position}`}
        />
      )}
      {media.placeholder && (
        <span className="label absolute top-3 right-3 bg-[#0e0e0ecc] px-2 py-1 text-[#f4f2ee]">
          Placeholder · {media.file}
        </span>
      )}
    </div>
  );
}
