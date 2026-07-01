import React, { useState } from "react";

/**
 * SmartImage — preserves ORIGINAL aspect ratio (never crops or stretches).
 * - Uses object-fit: contain so nothing is cut off.
 * - Optional blurred backdrop fills the empty area for a premium look.
 * - Set `adaptive` to let the container's height follow the image aspect
 *   (no fixed aspect box). Otherwise, place inside any container.
 */
export default function SmartImage({
  src,
  alt = "",
  className = "",
  backdrop = true,
  padding = "p-2",
  loading = "lazy",
  onLoad,
  onClick,
  testId,
  imgClassName = "",
}) {
  const [loaded, setLoaded] = useState(false);
  if (!src) return null;
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} onClick={onClick} data-testid={testId}>
      {backdrop && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="img-backdrop"
          loading="lazy"
        />
      )}
      <div className={`relative w-full h-full grid place-items-center ${padding}`}>
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={(e) => { setLoaded(true); onLoad && onLoad(e); }}
          className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </div>
  );
}

/**
 * NaturalImage — renders the image at its NATURAL aspect ratio,
 * allowing the container height to follow the image proportions.
 * Perfect for the main gallery view on the account page.
 */
export function NaturalImage({ src, alt = "", className = "", maxHeight = 640, onClick, testId, backdrop = true }) {
  const [dims, setDims] = useState(null);
  if (!src) return null;

  const onLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setDims({ w, h });
  };

  const paddingBottom = dims ? `${(dims.h / dims.w) * 100}%` : "60%";

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ paddingBottom }}
      onClick={onClick}
      data-testid={testId}
    >
      {backdrop && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="img-backdrop"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 grid place-items-center p-2">
        <img
          src={src}
          alt={alt}
          onLoad={onLoad}
          className="max-w-full max-h-full object-contain"
          style={{ width: "auto", height: "auto", maxHeight: `${maxHeight}px` }}
        />
      </div>
    </div>
  );
}
