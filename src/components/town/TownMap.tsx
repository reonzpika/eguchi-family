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
      <span
        className="block rounded-full"
        style={{
          filter: "drop-shadow(0 6px 5px rgba(60,42,26,0.18))",
        }}
      >
        {dashed ? (
          <span
            className="flex items-center justify-center rounded-2xl border-2 border-dashed border-[#9a8a6a]/70 bg-white/30"
            style={{ width: w, height: w * 0.62 }}
          >
            <span className="material-symbols-outlined text-[28px] text-[#7a6a4a]">add</span>
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
      <span className="mt-1 inline-block rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm backdrop-blur-sm">
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
 * The home town map. Each building navigates to a menu destination; ピコ wanders
 * the town and opens his chat on tap. At night ピコ sleeps by his cottage.
 * The user's business shows as a shop, or a bare lot when they have none.
 */
export function TownMap({ business }: { business: Business }) {
  // night is decided client-side; default to day to avoid a hydration mismatch
  const [isNight, setIsNight] = useState(false);
  useEffect(() => {
    const h = new Date().getHours();
    setIsNight(h >= 20 || h < 6);
  }, []);

  const cottage = { x: 18, y: 34 };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "calc(100dvh - 8.5rem)",
        background:
          "linear-gradient(180deg, #FFF1DE 0%, #FBE7C7 22%, #CFE9AE 52%, #BFE0A0 100%)",
      }}
    >
      {/* sky flourish */}
      <div
        className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-full"
        style={{
          background: isNight
            ? "radial-gradient(circle, #FFF6D8 0%, #F4E4A8 60%, transparent 70%)"
            : "radial-gradient(circle, #FFE9A8 0%, #FFD36E 55%, transparent 70%)",
          opacity: isNight ? 0.8 : 0.9,
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl px-4 pt-3">
        <p className="text-center text-sm font-extrabold tracking-wide text-[#6a5638]">
          エグチタウン {isNight ? "🌙" : "☀️"}
        </p>
      </div>

      {/* the town */}
      <div className="relative h-full w-full">
        {/* grassy base + a little road path, always behind buildings (low z) */}
        <Decor img="/town/ground.png" x={48} y={50} w={150} z={1} shadow={false} />
        <Decor img="/town/ground.png" x={30} y={62} w={140} z={1} shadow={false} />
        <Decor img="/town/road.png" x={52} y={46} w={120} z={2} shadow={false} />
        <Decor img="/town/road.png" x={44} y={56} w={120} z={2} shadow={false} />
        <Decor img="/town/road.png" x={60} y={52} w={120} z={2} shadow={false} />

        {/* decorative nature */}
        <Decor img="/town/tree-01.png" x={8} y={58} w={64} />
        <Decor img="/town/tree-03.png" x={88} y={42} w={70} />
        <Decor img="/town/tree-05.png" x={50} y={74} w={62} />
        <Decor img="/town/flowers-pink.png" x={30} y={44} w={34} />
        <Decor img="/town/flowers-yellow.png" x={58} y={68} w={34} />
        <Decor img="/town/tree-01.png" x={82} y={72} w={52} />

        {/* civic buildings */}
        <Building
          img="/town/cottage.png"
          alt="ピコのいえ"
          label="ピコのいえ"
          href="/pico"
          x={cottage.x}
          y={cottage.y}
          w={130}
        />
        <Building
          img="/town/market.png"
          alt="アイデアいちば"
          label="アイデアいちば"
          href="/explore"
          x={66}
          y={26}
          w={140}
        />
        <Building
          img="/town/library.png"
          alt="がくしゅうかん"
          label="がくしゅうかん"
          href="/learn"
          x={36}
          y={56}
          w={150}
        />

        {/* the user's business, or an empty lot */}
        {business ? (
          <Building
            img="/town/shop.png"
            alt={business.idea}
            label="わたしのおみせ"
            href="/business"
            x={72}
            y={60}
            w={130}
          />
        ) : (
          <Building
            img=""
            alt="あきち"
            label="あきち"
            href="/explore"
            x={72}
            y={60}
            w={120}
            dashed
          />
        )}

        {/* ピコ: wanders by day, sleeps by his cottage at night */}
        {isNight ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cottage.x + 9}%`, top: `${cottage.y + 12}%`, zIndex: 60 }}
          >
            <PicoAvatar size={52} mood="sleep" />
          </div>
        ) : (
          <div
            className="town-pico absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: "46%", top: "48%", zIndex: 60 }}
          >
            <Link
              href="/pico"
              aria-label="ピコとはなす"
              className="town-pico-bob block transition-transform duration-200 active:scale-90"
              style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}
            >
              <PicoAvatar size={56} mood="happy" />
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes town-wander {
          0%   { transform: translate(0px, 0px); }
          25%  { transform: translate(86px, 34px); }
          50%  { transform: translate(28px, 104px); }
          75%  { transform: translate(-62px, 56px); }
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
