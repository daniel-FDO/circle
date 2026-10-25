import { useState } from "react";
import { ImageIcon } from "./Icons";
import type { PostImage } from "../data/posts";

// Shows a neutral placeholder instead of a broken image icon if loading fails
const FallbackImage = ({ image, className }: { image: PostImage; className: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className} bg-surface-high flex items-center justify-center text-muted`}>
        <ImageIcon className="w-6 h-6" />
        <span className="sr-only">{image.alt} (image unavailable)</span>
      </div>
    );
  }
  return (
    <img
      src={image.src}
      alt={image.alt}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ objectPosition: image.position }}
      className={`${className} object-cover bg-surface-high`}
    />
  );
};

export default FallbackImage;
