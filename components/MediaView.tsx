import Image from "next/image";
import type { Media } from "@/lib/media";

// Shows one picture or recording, filling its box. While the real file is
// missing it shows the particle cover and says so in a small label.
export function MediaView({
  media,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  media: Media;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    // Positioned "relative" unless the caller already positions it (absolute).
    <div
      className={`overflow-hidden ${/\babsolute\b/.test(className) ? "" : "relative"} ${className}`}
    >
      {media.video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={media.src} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={media.src}
          alt={media.placeholder ? "" : alt}
          fill
          sizes={sizes}
          // The covers are already small; real screenshots get optimised.
          unoptimized={media.placeholder}
          preload={priority}
          className="object-cover"
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
