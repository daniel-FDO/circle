import { useState } from "react";

const tints = [
  "bg-primary-soft text-primary",
  "bg-amber-100 text-amber-800",
  "bg-emerald-100 text-emerald-800",
  "bg-sky-100 text-sky-800",
  "bg-rose-100 text-rose-800",
];

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("") || "?";

type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

// Falls back to tinted initials when there's no image or it fails to load
const Avatar = ({ name, src, className = "w-10 h-10 text-sm" }: AvatarProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const tint = tints[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % tints.length];
  const showImage = src && src !== failedSrc;

  return (
    <span
      className={`${className} ${showImage ? "bg-surface-high" : tint} rounded-full overflow-hidden inline-flex items-center justify-center font-semibold shrink-0 select-none`}
      aria-hidden
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        initials(name)
      )}
    </span>
  );
};

export default Avatar;
