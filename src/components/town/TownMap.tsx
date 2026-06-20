"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PicoAvatar } from "@/components/journey/Pico";

type Business = {
  id: string;
  idea: string;
  current_stage: string;
  status: string;
} | null;

/** A placed building: tap to navigate, with a label underneath. Pops in on load. */
function Building({
  img,
  alt,
  label,
  href,
  x,
  y,
  w,
  i = 0,
  dashed = false,
}: {
  img: string;
  alt: string;
  label: string;
  href: string;
  x: number;
  y: number;
  w: number;
  i?: number;
  dashed?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="town-pop group absolute -translate-x-1/2 -translate-y-1/2 text-center transition-transform duration-200 active:scale-95"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: Math.round(y) + 10, animationDelay: `${i * 90}ms` }}
    >
      <span className="block" style={{ filter: "drop-shadow(0 6px 5px rgba(60,42,26,0.18))" }}>
        {dashed ? (
          <span
            className="flex items-center justify-center rounded-2xl border-2 border-dashed border-[#9a8a6a]/70 bg-white/30"
            style={{ width: w, height: w * 0.6 }}
          >
            <span className="material-symbols-outlined text-[26px] text-[#7a6a4a]">add</span>
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={alt}
            draggable={false}
            className="select-none transition-transform duration-200 group-hover:-translate-y-1"
            style={{ width: w, height: "auto" }}
          />
        )}
      </span>
      <span className="-mt-1 inline-block rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm backdrop-blur-sm">
        {label}
      </span>
    </Link>
  );
}

/** A decorative tile (tree, flowers, ground, road). Not interactive. Optional gentle sway. */
function Decor({
  img,
  x,
  y,
  w,
  z,
  shadow = true,
  sway = false,
}: {
  img: string;
  x: number;
  y: number;
  w: number;
  z?: number;
  shadow?: boolean;
  sway?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt=""
      aria-hidden
      draggable={false}
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none${sway ? " town-sway" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: w,
        height: "auto",
        zIndex: z ?? Math.round(y),
        transformOrigin: "bottom center",
        filter: shadow ? "drop-shadow(0 4px 3px rgba(60,42,26,0.14))" : undefined,
      }}
    />
  );
}

/** A cute side-view cat that ambles along the lane. */
function Cat() {
  return (
    <div className="town-cat pointer-events-none absolute" style={{ top: "70%", zIndex: 48 }} aria-hidden>
      <div className="town-cat-bob" style={{ filter: "drop-shadow(0 3px 2px rgba(60,42,26,0.2))" }}>
        <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
          <path d="M5 16 q-6 -3 -5 -11" stroke="#E8A85C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="17" cy="17" rx="12" ry="7" fill="#E8A85C" />
          <rect x="11" y="21" width="2.6" height="6" rx="1.3" fill="#D8954A" />
          <rect x="21" y="21" width="2.6" height="6" rx="1.3" fill="#D8954A" />
          <circle cx="29" cy="12" r="6" fill="#E8A85C" />
          <path d="M24 6.5 l1.4 4.2 -4 -0.6z" fill="#E8A85C" />
          <path d="M31 6.5 l2 3.6 -3.6 0.6z" fill="#E8A85C" />
          <circle cx="30.5" cy="12" r="1" fill="#3A2A1A" />
          <circle cx="33.6" cy="13" r="0.8" fill="#FF9E9E" />
        </svg>
      </div>
    </div>
  );
}

/** A little bird gliding across the sky. */
function Bird() {
  return (
    <div className="town-bird pointer-events-none absolute" style={{ zIndex: 5 }} aria-hidden>
      <div className="town-bird-flap">
        <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
          <ellipse cx="13" cy="9" rx="5" ry="3.2" fill="#8FBEEA" />
          <circle cx="18" cy="7" r="2.4" fill="#8FBEEA" />
          <path d="M20 6.4 l3 -1 -2 2.2z" fill="#FFB347" />
          <circle cx="19" cy="6.6" r="0.6" fill="#3A2A1A" />
          <path d="M9 8 q-5 -5 -8 -2" stroke="#8FBEEA" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/** A fluttering butterfly near the flowers. */
function Butterfly() {
  return (
    <div className="town-bfly pointer-events-none absolute" style={{ left: "42%", top: "36%", zIndex: 30 }} aria-hidden>
      <svg width="18" height="16" viewBox="0 0 20 18" fill="none">
        <ellipse className="town-bfly-wl" cx="7" cy="9" rx="5" ry="7" fill="#FF9ECF" />
        <ellipse className="town-bfly-wr" cx="13" cy="9" rx="5" ry="7" fill="#FFC36E" />
        <rect x="9.3" y="3" width="1.4" height="12" rx="0.7" fill="#3A2A1A" />
      </svg>
    </div>
  );
}

/**
 * The home town map. Fills its container (no scroll). Buildings navigate to menu
 * destinations; ピコ wears a name tag, wanders by day and sleeps by his cottage at
 * night. Clouds drift, a bird glides, a butterfly flutters, a cat ambles, trees sway.
 */
export function TownMap({ business }: { business: Business }) {
  const [isNight, setIsNight] = useState(false);
  useEffect(() => {
    const h = new Date().getHours();
    setIsNight(h >= 20 || h < 6);
  }, []);

  const cottage = { x: 20, y: 26 };

  const picoName = (
    <span className="mb-0.5 inline-block rounded-full bg-[#3A2A1A]/85 px-2 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm">
      ピコ
    </span>
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: isNight
          ? "linear-gradient(180deg, #2B2E4A 0%, #4A4E73 28%, #6E8E5A 62%, #5F8050 100%)"
          : "linear-gradient(180deg, #FFF1DE 0%, #FBE7C7 20%, #D4EBB4 50%, #BFE0A0 100%)",
        transition: "background 1.2s ease",
      }}
    >
      {/* sun / moon */}
      <div
        className="town-celestial pointer-events-none absolute right-7 top-5 h-14 w-14 rounded-full"
        style={{
          background: isNight
            ? "radial-gradient(circle, #FFFDF0 0%, #F4E8B0 58%, transparent 70%)"
            : "radial-gradient(circle, #FFE9A8 0%, #FFD36E 55%, transparent 70%)",
          opacity: 0.95,
          zIndex: 4,
        }}
        aria-hidden
      />

      {/* sky life */}
      {isNight ? (
        <>
          <span className="town-twinkle pointer-events-none absolute left-[14%] top-[12%] text-xs" style={{ zIndex: 4 }} aria-hidden>✦</span>
          <span className="town-twinkle pointer-events-none absolute left-[34%] top-[8%] text-[10px]" style={{ zIndex: 4, animationDelay: "0.6s" }} aria-hidden>✦</span>
          <span className="town-twinkle pointer-events-none absolute left-[58%] top-[14%] text-[9px]" style={{ zIndex: 4, animationDelay: "1.1s" }} aria-hidden>✦</span>
          <span className="town-twinkle pointer-events-none absolute left-[80%] top-[10%] text-xs" style={{ zIndex: 4, animationDelay: "0.3s" }} aria-hidden>✦</span>
        </>
      ) : (
        <>
          <div className="town-cloud town-cloud-1 pointer-events-none absolute h-6 w-16 rounded-full bg-white/70" style={{ top: "13%", zIndex: 3 }} aria-hidden />
          <div className="town-cloud town-cloud-2 pointer-events-none absolute h-5 w-12 rounded-full bg-white/60" style={{ top: "22%", zIndex: 3 }} aria-hidden />
          <Bird />
          <Butterfly />
        </>
      )}

      {/* town title */}
      <p
        className="pointer-events-none absolute left-1/2 top-3 z-[5] -translate-x-1/2 rounded-full bg-white/70 px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#6a5638]"
      >
        エグチタウン {isNight ? "🌙" : "☀️"}
      </p>

      {/* positioning layer fills the whole map area */}
      <div className="absolute inset-0">
        {/* grassy base + lane (behind everything) */}
        <Decor img="/town/ground.png" x={48} y={46} w={150} z={1} shadow={false} />
        <Decor img="/town/ground.png" x={30} y={56} w={140} z={1} shadow={false} />
        <Decor img="/town/road.png" x={52} y={40} w={118} z={2} shadow={false} />
        <Decor img="/town/road.png" x={44} y={50} w={118} z={2} shadow={false} />
        <Decor img="/town/road.png" x={60} y={46} w={118} z={2} shadow={false} />

        {/* nature (some trees sway) */}
        <Decor img="/town/tree-01.png" x={9} y={40} w={58} sway />
        <Decor img="/town/tree-03.png" x={91} y={44} w={62} sway />
        <Decor img="/town/tree-05.png" x={50} y={66} w={56} sway />
        <Decor img="/town/tree-01.png" x={85} y={64} w={48} />
        <Decor img="/town/flowers-pink.png" x={38} y={34} w={30} />
        <Decor img="/town/flowers-yellow.png" x={64} y={60} w={30} />

        {/* the wandering cat (nocturnal too) */}
        <Cat />

        {/* civic buildings */}
        <Building img="/town/cottage.png" alt="ピコのいえ" label="ピコのいえ" href="/pico" x={cottage.x} y={cottage.y} w={120} i={0} />
        <Building img="/town/market.png" alt="アイデアいちば" label="アイデアいちば" href="/explore" x={73} y={24} w={128} i={1} />
        <Building img="/town/library.png" alt="がくしゅうかん" label="がくしゅうかん" href="/learn" x={33} y={50} w={134} i={2} />

        {/* the user's business, or an empty lot */}
        {business ? (
          <Building img="/town/shop.png" alt={business.idea} label="わたしのおみせ" href="/business" x={71} y={56} w={118} i={3} />
        ) : (
          <Building img="" alt="あきち" label="あきち" href="/explore" x={71} y={56} w={112} i={3} dashed />
        )}

        {/* ピコ: name tag + wanders by day, sleeps by his cottage at night */}
        {isNight ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cottage.x + 10}%`, top: `${cottage.y + 13}%`, zIndex: 60 }}
          >
            <Link href="/pico" aria-label="ピコとはなす" className="flex flex-col items-center active:scale-90" style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}>
              {picoName}
              <PicoAvatar size={50} mood="sleep" />
            </Link>
          </div>
        ) : (
          <div
            className="town-pico absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50%", top: "42%", zIndex: 60 }}
          >
            <Link
              href="/pico"
              aria-label="ピコとはなす"
              className="town-pico-bob flex flex-col items-center transition-transform duration-200 active:scale-90"
              style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}
            >
              {picoName}
              <PicoAvatar size={54} mood="happy" />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes town-wander {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(70px, 26px); }
          50%  { transform: translate(20px, 70px); }
          75%  { transform: translate(-58px, 38px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes town-bob { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes town-pop { 0% { opacity: 0; transform: translate(-50%,-50%) scale(0.82); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
        @keyframes town-sway { 0%,100% { transform: translate(-50%,-50%) rotate(-2.2deg); } 50% { transform: translate(-50%,-50%) rotate(2.2deg); } }
        @keyframes town-cloud-1 { 0% { left: -22%; } 100% { left: 118%; } }
        @keyframes town-cloud-2 { 0% { left: -18%; } 100% { left: 116%; } }
        @keyframes town-bird { 0% { left: -12%; top: 16%; } 50% { top: 9%; } 100% { left: 116%; top: 15%; } }
        @keyframes town-bird-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.55); } }
        @keyframes town-bfly { 0% { transform: translate(0,0); } 25% { transform: translate(26px,-18px); } 50% { transform: translate(50px,8px); } 75% { transform: translate(18px,22px); } 100% { transform: translate(0,0); } }
        @keyframes town-bfly-wl { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.3); } }
        @keyframes town-bfly-wr { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.3); } }
        @keyframes town-cat { 0% { left: 12%; transform: scaleX(1); } 47% { left: 46%; transform: scaleX(1); } 50% { left: 46%; transform: scaleX(-1); } 97% { left: 12%; transform: scaleX(-1); } 100% { left: 12%; transform: scaleX(1); } }
        @keyframes town-cat-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes town-twinkle { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes town-celestial { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }

        .town-pico { animation: town-wander 22s ease-in-out infinite; }
        .town-pico-bob { animation: town-bob 2.4s ease-in-out infinite; }
        .town-pop { animation: town-pop 0.5s cubic-bezier(.2,.8,.2,1.2) both; }
        .town-sway { animation: town-sway 4.5s ease-in-out infinite; color: #fff; }
        .town-cloud-1 { animation: town-cloud-1 48s linear infinite; }
        .town-cloud-2 { animation: town-cloud-2 64s linear infinite; }
        .town-bird { animation: town-bird 17s linear infinite; }
        .town-bird-flap { animation: town-bird-flap 0.4s ease-in-out infinite; }
        .town-bfly { animation: town-bfly 9s ease-in-out infinite; }
        .town-bfly-wl { transform-origin: right center; animation: town-bfly-wl 0.3s ease-in-out infinite; }
        .town-bfly-wr { transform-origin: left center; animation: town-bfly-wr 0.3s ease-in-out infinite; }
        .town-cat { animation: town-cat 26s ease-in-out infinite; }
        .town-cat-bob { animation: town-cat-bob 0.5s ease-in-out infinite; }
        .town-twinkle { animation: town-twinkle 2.4s ease-in-out infinite; color: #FFF6D8; }
        .town-celestial { animation: town-celestial 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .town-pico, .town-pico-bob, .town-sway, .town-cloud-1, .town-cloud-2, .town-bird, .town-bird-flap, .town-bfly, .town-bfly-wl, .town-bfly-wr, .town-cat, .town-cat-bob, .town-twinkle, .town-celestial { animation: none; }
          .town-pop { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
