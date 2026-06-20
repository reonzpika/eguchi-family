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

/** A placed building: tap to navigate, with a label underneath. */
function Building({
  img,
  alt,
  label,
  href,
  x,
  y,
  w,
  dashed = false,
}: {
  img: string;
  alt: string;
  label: string;
  href: string;
  x: number;
  y: number;
  w: number;
  dashed?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group absolute -translate-x-1/2 -translate-y-1/2 text-center transition-transform duration-200 active:scale-95"
      style={{ left: `${x}%`, top: `${y}%`, zIndex: Math.round(y) + 10 }}
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

/** A decorative tile (tree, flowers, ground, road). Not interactive. */
function Decor({
  img,
  x,
  y,
  w,
  z,
  shadow = true,
}: {
  img: string;
  x: number;
  y: number;
  w: number;
  z?: number;
  shadow?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img}
      alt=""
      aria-hidden
      draggable={false}
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: w,
        height: "auto",
        zIndex: z ?? Math.round(y),
        filter: shadow ? "drop-shadow(0 4px 3px rgba(60,42,26,0.14))" : undefined,
      }}
    />
  );
}

/**
 * The home town map. Fills its container (no scroll). Each building navigates to
 * a menu destination; ピコ wanders by day and sleeps by his cottage at night.
 * The user's business shows as a shop, or a bare lot when they have none.
 * Interactive elements stay in the upper ~70% so the fixed bottom nav never covers them.
 */
export function TownMap({ business }: { business: Business }) {
  const [isNight, setIsNight] = useState(false);
  useEffect(() => {
    const h = new Date().getHours();
    setIsNight(h >= 20 || h < 6);
  }, []);

  const cottage = { x: 20, y: 26 };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #FFF1DE 0%, #FBE7C7 20%, #D4EBB4 50%, #BFE0A0 100%)",
      }}
    >
      {/* sun / moon */}
      <div
        className="pointer-events-none absolute right-7 top-5 h-14 w-14 rounded-full"
        style={{
          background: isNight
            ? "radial-gradient(circle, #FFF6D8 0%, #F4E4A8 60%, transparent 70%)"
            : "radial-gradient(circle, #FFE9A8 0%, #FFD36E 55%, transparent 70%)",
          opacity: 0.9,
          zIndex: 4,
        }}
        aria-hidden
      />

      {/* town title */}
      <p
        className="pointer-events-none absolute left-1/2 top-3 z-[5] -translate-x-1/2 rounded-full bg-white/70 px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#6a5638]"
      >
        エグチタウン {isNight ? "🌙" : "☀️"}
      </p>

      {/* positioning layer fills the whole map area */}
      <div className="absolute inset-0">
        {/* grassy base + a little road path, behind everything (low z) */}
        <Decor img="/town/ground.png" x={48} y={46} w={150} z={1} shadow={false} />
        <Decor img="/town/ground.png" x={30} y={56} w={140} z={1} shadow={false} />
        <Decor img="/town/road.png" x={52} y={40} w={118} z={2} shadow={false} />
        <Decor img="/town/road.png" x={44} y={50} w={118} z={2} shadow={false} />
        <Decor img="/town/road.png" x={60} y={46} w={118} z={2} shadow={false} />

        {/* nature */}
        <Decor img="/town/tree-01.png" x={9} y={40} w={58} />
        <Decor img="/town/tree-03.png" x={91} y={44} w={62} />
        <Decor img="/town/tree-05.png" x={50} y={66} w={56} />
        <Decor img="/town/tree-01.png" x={85} y={64} w={48} />
        <Decor img="/town/flowers-pink.png" x={38} y={34} w={30} />
        <Decor img="/town/flowers-yellow.png" x={64} y={60} w={30} />

        {/* civic buildings */}
        <Building img="/town/cottage.png" alt="ピコのいえ" label="ピコのいえ" href="/pico" x={cottage.x} y={cottage.y} w={120} />
        <Building img="/town/market.png" alt="アイデアいちば" label="アイデアいちば" href="/explore" x={73} y={24} w={128} />
        <Building img="/town/library.png" alt="がくしゅうかん" label="がくしゅうかん" href="/learn" x={33} y={50} w={134} />

        {/* the user's business, or an empty lot */}
        {business ? (
          <Building img="/town/shop.png" alt={business.idea} label="わたしのおみせ" href="/business" x={71} y={56} w={118} />
        ) : (
          <Building img="" alt="あきち" label="あきち" href="/explore" x={71} y={56} w={112} dashed />
        )}

        {/* ピコ: wanders by day, sleeps by his cottage at night */}
        {isNight ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cottage.x + 10}%`, top: `${cottage.y + 13}%`, zIndex: 60 }}
          >
            <PicoAvatar size={50} mood="sleep" />
          </div>
        ) : (
          <div
            className="town-pico absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50%", top: "42%", zIndex: 60 }}
          >
            <Link
              href="/pico"
              aria-label="ピコとはなす"
              className="town-pico-bob block transition-transform duration-200 active:scale-90"
              style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}
            >
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
        @keyframes town-bob {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        .town-pico { animation: town-wander 22s ease-in-out infinite; }
        .town-pico-bob { animation: town-bob 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .town-pico, .town-pico-bob { animation: none; }
        }
      `}</style>
    </div>
  );
}
