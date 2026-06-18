/** ピコ avatar (a cute curious spark buddy) + a speech bubble. */

export function PicoAvatar({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <radialGradient id="pico-body" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#FFE3B3" />
          <stop offset="100%" stopColor="#FFB877" />
        </radialGradient>
      </defs>
      {/* sparkles */}
      <path d="M54 12l1.6 4.4L60 18l-4.4 1.6L54 24l-1.6-4.4L48 18l4.4-1.6z" fill="#FFD36E" />
      <circle cx="12" cy="20" r="2" fill="#FFD36E" />
      {/* body */}
      <rect x="12" y="16" width="40" height="40" rx="20" fill="url(#pico-body)" />
      {/* cheeks */}
      <circle cx="22" cy="42" r="4" fill="#FF9E9E" opacity="0.55" />
      <circle cx="42" cy="42" r="4" fill="#FF9E9E" opacity="0.55" />
      {/* eyes (big, curious, looking up) */}
      <circle cx="25" cy="34" r="6" fill="#fff" />
      <circle cx="39" cy="34" r="6" fill="#fff" />
      <circle cx="26" cy="33" r="3.2" fill="#3A2A1A" />
      <circle cx="40" cy="33" r="3.2" fill="#3A2A1A" />
      <circle cx="27.2" cy="31.8" r="1" fill="#fff" />
      <circle cx="41.2" cy="31.8" r="1" fill="#fff" />
      {/* smile */}
      <path d="M28 44c2 2.4 6 2.4 8 0" stroke="#3A2A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PicoBubble({ line, size = 44 }: { line: string; size?: number }) {
  if (!line) return null;
  return (
    <div className="mb-5 flex items-start gap-3">
      <PicoAvatar size={size} />
      <div className="relative mt-1 flex-1 rounded-2xl rounded-tl-sm bg-secondary-container px-4 py-3 text-sm leading-relaxed text-on-secondary-container">
        {line}
      </div>
    </div>
  );
}
