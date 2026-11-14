import Image from "next/image";
import type { Media } from "@/lib/media";
import { LazyVideo } from "./LazyVideo";

// Shows one picture or recording, filling its box. While the real file is
// missing it shows the particle cover and says so in a small label.
//
// A tall picture (a phone screenshot) in a wide box would be cropped to a
// strip, so it is shown whole instead, standing in a phone outline on the
// project's cover. Pass `inPhone` when the caller has already drawn a phone
// around it.
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

  if (media.portrait && !inPhone) {
    const slug = media.file.split("-")[0];
    return (
      <div className={box}>
        <Image
          src={`/media/cover-${slug}.avif`}
          alt=""
          fill
          unoptimized
          sizes={sizes}
          className="object-cover opacity-60"
        />
        <div className="absolute inset-y-[7%] left-1/2 aspect-[9/19.5] -translate-x-1/2 overflow-hidden rounded-[1.6rem] border-[6px] border-[#1d1d1d] bg-[#0b0b0b] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
          <Image
            src={media.src}
            alt={alt}
            fill
            sizes="22rem"
            preload={priority}
            className="object-cover object-top"
          />
        </div>
      </div>
    );
  }

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
