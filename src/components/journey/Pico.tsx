/** ピコ avatar (a cute curious spark buddy) + a speech bubble.
 *  One SVG character, six swappable moods. The face, body and cheeks stay
 *  constant; only the eyes, mouth and ambience change per mood, so ピコ is
 *  always recognisably the same buddy. mood defaults to "happy", which is the
 *  original face, so every existing usage renders unchanged. */

export type PicoMood =
  | "happy"
  | "cheer"
  | "think"
  | "surprised"
  | "sleep"
  | "tired"
  | "celebrate";

export const PICO_MOODS: PicoMood[] = [
  "happy",
  "cheer",
  "think",
  "surprised",
  "sleep",
  "tired",
  "celebrate",
];

export function PicoAvatar({
  size = 48,
  mood = "happy",
}: {
  size?: number;
  mood?: PicoMood;
}) {
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
      {/* ambience behind the body: sparkles, z's or confetti per mood */}
      <PicoAmbience mood={mood} />
      {/* body */}
      <rect x="12" y="16" width="40" height="40" rx="20" fill="url(#pico-body)" />
      {/* cheeks */}
      <circle cx="22" cy="42" r="4" fill="#FF9E9E" opacity="0.55" />
      <circle cx="42" cy="42" r="4" fill="#FF9E9E" opacity="0.55" />
      {/* eyes + mouth per mood */}
      <PicoFace mood={mood} />
    </svg>
  );
}

/** The eyes and mouth, swapped per mood. Same coordinate system every time. */
function PicoFace({ mood }: { mood: PicoMood }) {
  switch (mood) {
    case "cheer":
    case "celebrate":
      return (
        <>
          {/* happy closed eyes (upward arcs) */}
          <path d="M21 35q4-6 8 0" stroke="#3A2A1A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M35 35q4-6 8 0" stroke="#3A2A1A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          {/* open happy mouth */}
          <path d="M27 43q5 7 10 0z" fill="#3A2A1A" />
        </>
      );
    case "surprised":
      return (
        <>
          {/* wide eyes */}
          <circle cx="25" cy="34" r="6.6" fill="#fff" />
          <circle cx="39" cy="34" r="6.6" fill="#fff" />
          <circle cx="25" cy="34" r="3" fill="#3A2A1A" />
          <circle cx="39" cy="34" r="3" fill="#3A2A1A" />
          <circle cx="26" cy="32.8" r="1" fill="#fff" />
          <circle cx="40" cy="32.8" r="1" fill="#fff" />
          {/* small open "o" mouth */}
          <ellipse cx="32" cy="46" rx="2.4" ry="3" fill="#3A2A1A" />
        </>
      );
    case "think":
      return (
        <>
          {/* eyes glancing up */}
          <circle cx="25" cy="34" r="6" fill="#fff" />
          <circle cx="39" cy="34" r="6" fill="#fff" />
          <circle cx="25.5" cy="31.8" r="3" fill="#3A2A1A" />
          <circle cx="39.5" cy="31.8" r="3" fill="#3A2A1A" />
          <circle cx="26.7" cy="30.6" r="0.9" fill="#fff" />
          <circle cx="40.7" cy="30.6" r="0.9" fill="#fff" />
          {/* small pursed mouth, off to one side */}
          <path d="M29 45q3-1.6 5 0.4" stroke="#3A2A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      );
    case "sleep":
      return (
        <>
          {/* closed, content eyes (downward arcs) */}
          <path d="M21 33q4 5 8 0" stroke="#3A2A1A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M35 33q4 5 8 0" stroke="#3A2A1A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* tiny soft mouth */}
          <path d="M30 45q2 1.6 4 0" stroke="#3A2A1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </>
      );
    case "tired":
      return (
        <>
          {/* heavy, droopy half-closed eyes */}
          <path d="M20 34q5 3 9 0" stroke="#3A2A1A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M35 34q5 3 9 0" stroke="#3A2A1A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="24.5" cy="35.6" r="1.3" fill="#3A2A1A" />
          <circle cx="39.5" cy="35.6" r="1.3" fill="#3A2A1A" />
          {/* small weary mouth */}
          <path d="M29 45q3 1.4 6 0" stroke="#3A2A1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </>
      );
    case "happy":
    default:
      return (
        <>
          {/* big, curious eyes looking up */}
          <circle cx="25" cy="34" r="6" fill="#fff" />
          <circle cx="39" cy="34" r="6" fill="#fff" />
          <circle cx="26" cy="33" r="3.2" fill="#3A2A1A" />
          <circle cx="40" cy="33" r="3.2" fill="#3A2A1A" />
          <circle cx="27.2" cy="31.8" r="1" fill="#fff" />
          <circle cx="41.2" cy="31.8" r="1" fill="#fff" />
          {/* gentle smile */}
          <path d="M28 44c2 2.4 6 2.4 8 0" stroke="#3A2A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      );
  }
}

/** Background flourish per mood: sparkles (default), z's (sleep), confetti (celebrate). */
function PicoAmbience({ mood }: { mood: PicoMood }) {
  if (mood === "sleep") {
    return (
      <>
        <path d="M44 16h4l-4 5h4" stroke="#9AA8B5" strokeWidth="1.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M50 9h3l-3 3.6h3" stroke="#9AA8B5" strokeWidth="1.2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </>
    );
  }
  if (mood === "celebrate") {
    return (
      <>
        <circle cx="14" cy="14" r="1.8" fill="#FF9E9E" />
        <rect x="46" y="11" width="3" height="3" rx="0.6" fill="#7FD4FF" transform="rotate(20 47 12)" />
        <circle cx="53" cy="28" r="1.6" fill="#9BD98A" />
        <rect x="9" y="30" width="3" height="3" rx="0.6" fill="#FFD36E" transform="rotate(-15 10 31)" />
        <circle cx="51" cy="49" r="1.6" fill="#FF9E9E" />
        <path d="M16 45l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill="#FFD36E" />
      </>
    );
  }
  // default sparkles; an extra one when cheering
  return (
    <>
      <path d="M54 12l1.6 4.4L60 18l-4.4 1.6L54 24l-1.6-4.4L48 18l4.4-1.6z" fill="#FFD36E" />
      <circle cx="12" cy="20" r="2" fill="#FFD36E" />
      {mood === "cheer" && (
        <path d="M16 40l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill="#FFD36E" />
      )}
    </>
  );
}

export function PicoBubble({
  line,
  size = 44,
  mood = "happy",
}: {
  line: string;
  size?: number;
  mood?: PicoMood;
}) {
  if (!line) return null;
  return (
    <div className="mb-5 flex items-start gap-3">
      <PicoAvatar size={size} mood={mood} />
      <div className="relative mt-1 flex-1 rounded-2xl rounded-tl-sm bg-secondary-container px-4 py-3 text-sm leading-relaxed text-on-secondary-container">
        {line}
      </div>
    </div>
  );
}
