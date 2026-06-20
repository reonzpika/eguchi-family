"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PicoAvatar } from "@/components/journey/Pico";

type Business = {
  id: string;
  idea: string;
  current_stage: string;
  status: string;
} | null;

/* ---- isometric grid maths (design space) ----
 * Tiles sit on a diamond grid: screenX=(col-row)*TW/2, screenY=(col+row)*TH/2.
 * Source ground tile is 257x129 (a 2:1 diamond); we render it at TW wide. */
const SRC_TW = 257;
const TW = 116; // rendered tile width
const TH = (TW * 129) / 257; // rendered tile height (~58)
const S = TW / SRC_TW; // sprite scale from source px

const COLS = 5;
const ROWS = 5;
const ORIGIN_X = (ROWS - 1) * (TW / 2); // keep posX >= 0
const ORIGIN_Y = 150; // headroom for tall buildings/trees
const DW = (COLS - 1 + ROWS - 1) * (TW / 2) + TW; // design canvas width
const DH = ORIGIN_Y + (COLS - 1 + ROWS - 1) * (TH / 2) + TH + 28; // design canvas height

function tilePos(col: number, row: number) {
  return {
    x: ORIGIN_X + (col - row) * (TW / 2),
    y: ORIGIN_Y + (col + row) * (TH / 2),
  };
}
function cellCenter(col: number, row: number) {
  const p = tilePos(col, row);
  return { x: p.x + TW / 2, y: p.y + TH / 2 };
}
const depth = (col: number, row: number) => (col + row) * 2;

/* ---- map definition ---- */
const ROAD = new Set<string>();
for (let i = 0; i < COLS; i++) {
  ROAD.add(`2,${i}`); // central column
  ROAD.add(`${i},2`); // central row
}
const isRoad = (c: number, r: number) => ROAD.has(`${c},${r}`);

type Obj = { src: string; sw: number; sh: number };
const SP = {
  cottage: { src: "/town/cottage.png", sw: 225, sh: 193 },
  market: { src: "/town/market.png", sw: 261, sh: 203 },
  library: { src: "/town/library.png", sw: 425, sh: 345 },
  shop: { src: "/town/shop.png", sw: 225, sh: 193 },
  tree1: { src: "/town/tree-01.png", sw: 139, sh: 210 },
  tree3: { src: "/town/tree-03.png", sw: 142, sh: 209 },
  tree5: { src: "/town/tree-05.png", sw: 134, sh: 193 },
  fpink: { src: "/town/flowers-pink.png", sw: 24, sh: 13 },
  fyellow: { src: "/town/flowers-yellow.png", sw: 24, sh: 13 },
} satisfies Record<string, Obj>;

// decorative objects on ground cells: [col, row, sprite, scaleMul]
const DECOR: [number, number, Obj, number?][] = [
  [1, 1, SP.tree1], [3, 1, SP.tree3], [1, 3, SP.tree5], [3, 3, SP.tree1],
  [0, 1, SP.tree3, 0.85], [4, 3, SP.tree5, 0.85],
  [1, 0, SP.fpink, 1], [3, 4, SP.fyellow, 1], [0, 3, SP.fpink, 1],
];

// ピコ patrols the road, cell by cell
const PICO_PATH: [number, number][] = [
  [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [2, 1], [2, 2],
  [3, 2], [4, 2], [3, 2], [2, 2], [2, 3], [2, 4], [2, 3],
];

/** A building tile: tap to navigate, label underneath, pops in on load. */
function BuildingTile({
  col,
  row,
  obj,
  label,
  href,
  i,
  scaleMul = 1,
}: {
  col: number;
  row: number;
  obj: Obj;
  label: string;
  href: string;
  i: number;
  scaleMul?: number;
}) {
  const p = tilePos(col, row);
  const w = obj.sw * S * scaleMul;
  const h = obj.sh * S * scaleMul;
  const ox = p.x + (TW - w) / 2;
  const oy = p.y + TH - h;
  return (
    <Link
      href={href}
      aria-label={label}
      className="town-pop group absolute active:scale-95"
      style={{ left: ox, top: oy, width: w, zIndex: depth(col, row) + 1, animationDelay: `${i * 90}ms`, transformOrigin: "bottom center" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={obj.src}
        alt={label}
        draggable={false}
        className="select-none transition-transform duration-200 group-hover:-translate-y-1"
        style={{ width: w, height: h, filter: "drop-shadow(0 6px 5px rgba(60,42,26,0.18))" }}
      />
      <span
        className="absolute left-1/2 top-full inline-block -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm"
      >
        {label}
      </span>
    </Link>
  );
}

/** Empty lot: a dashed plot on its ground cell. */
function LotTile({ col, row, label, href, i }: { col: number; row: number; label: string; href: string; i: number }) {
  const p = tilePos(col, row);
  return (
    <Link
      href={href}
      aria-label={label}
      className="town-pop group absolute flex flex-col items-center active:scale-95"
      style={{ left: p.x + TW * 0.18, top: p.y + TH * 0.1, width: TW * 0.64, zIndex: depth(col, row) + 1, animationDelay: `${i * 90}ms`, transformOrigin: "bottom center" }}
    >
      <span className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-[#8a7a5a]/70 bg-white/20" style={{ height: TH * 0.7 }}>
        <span className="material-symbols-outlined text-[24px] text-[#6a5a3a]">add</span>
      </span>
      <span className="mt-0.5 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm">{label}</span>
    </Link>
  );
}

/** A side-view cat that ambles across the foreground (screen-space). */
function Cat() {
  return (
    <div className="town-cat pointer-events-none absolute" style={{ bottom: "12%", zIndex: 900 }} aria-hidden>
      <div className="town-cat-bob" style={{ filter: "drop-shadow(0 3px 2px rgba(60,42,26,0.2))" }}>
        <svg width="38" height="26" viewBox="0 0 40 28" fill="none">
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

function Butterfly() {
  return (
    <div className="town-bfly pointer-events-none absolute" style={{ left: "30%", top: "30%", zIndex: 800 }} aria-hidden>
      <svg width="18" height="16" viewBox="0 0 20 18" fill="none">
        <ellipse className="town-bfly-wl" cx="7" cy="9" rx="5" ry="7" fill="#FF9ECF" />
        <ellipse className="town-bfly-wr" cx="13" cy="9" rx="5" ry="7" fill="#FFC36E" />
        <rect x="9.3" y="3" width="1.4" height="12" rx="0.7" fill="#3A2A1A" />
      </svg>
    </div>
  );
}

export function TownMap({ business }: { business: Business }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [night, setNight] = useState<boolean | null>(null);

  // initial day/night from the clock (user can toggle)
  useEffect(() => {
    const h = new Date().getHours();
    setNight(h >= 19 || h < 6);
  }, []);

  // fit the fixed-size town canvas to the container
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setScale(Math.min(w / DW, h / DH, 1.25));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isNight = !!night;

  // build ピコ's walk keyframes from the road path (deterministic)
  const picoFrames = PICO_PATH.map((c, idx) => {
    const ctr = cellCenter(c[0], c[1]);
    const pct = ((idx / PICO_PATH.length) * 100).toFixed(2);
    return `${pct}% { transform: translate(${ctr.x.toFixed(1)}px, ${(ctr.y - 6).toFixed(1)}px); }`;
  });
  const first = cellCenter(PICO_PATH[0][0], PICO_PATH[0][1]);
  picoFrames.push(`100% { transform: translate(${first.x.toFixed(1)}px, ${(first.y - 6).toFixed(1)}px); }`);

  // ground/road tiles
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = tilePos(c, r);
      tiles.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`g${c}-${r}`}
          src={isRoad(c, r) ? "/town/road.png" : "/town/ground.png"}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{ left: p.x, top: p.y, width: TW + 1, height: TH + 1, zIndex: depth(c, r) }}
        />
      );
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden"
      style={{
        background: isNight
          ? "linear-gradient(180deg, #2B2E4A 0%, #4A4E73 30%, #6E8E5A 64%, #5F8050 100%)"
          : "linear-gradient(180deg, #FFF1DE 0%, #FBE7C7 20%, #CFE9AE 52%, #BFE0A0 100%)",
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
          zIndex: 4,
        }}
        aria-hidden
      />

      {/* sky life */}
      {isNight ? (
        <>
          {["14%,12%,0s", "34%,8%,.6s", "58%,14%,1.1s", "80%,10%,.3s"].map((s, k) => {
            const [l, t, d] = s.split(",");
            return (
              <span key={k} className="town-twinkle pointer-events-none absolute text-[10px]" style={{ left: l, top: t, zIndex: 4, animationDelay: d }} aria-hidden>✦</span>
            );
          })}
        </>
      ) : (
        <>
          <div className="town-cloud town-cloud-1 pointer-events-none absolute h-6 w-16 rounded-full bg-white/70" style={{ top: "12%", zIndex: 3 }} aria-hidden />
          <div className="town-cloud town-cloud-2 pointer-events-none absolute h-5 w-12 rounded-full bg-white/60" style={{ top: "20%", zIndex: 3 }} aria-hidden />
          <Bird />
          <Butterfly />
        </>
      )}

      {/* title + day/night toggle */}
      <p className="pointer-events-none absolute left-1/2 top-3 z-[5] -translate-x-1/2 rounded-full bg-white/70 px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#6a5638]">
        エグチタウン {isNight ? "🌙" : "☀️"}
      </p>
      <button
        type="button"
        onClick={() => setNight((n) => !n)}
        className="absolute left-3 top-3 z-[6] flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6a5638] shadow-sm active:scale-90"
        aria-label={isNight ? "昼にする" : "夜にする"}
      >
        <span className="material-symbols-outlined text-[18px]">{isNight ? "light_mode" : "dark_mode"}</span>
      </button>

      <Cat />

      {/* the isometric town, scaled to fit */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: DW, height: DH, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center" }}
      >
        {tiles}

        {DECOR.map(([c, r, sp, m], k) => {
          const p = tilePos(c, r);
          const w = sp.sw * S * (m ?? 1);
          const h = sp.sh * S * (m ?? 1);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`d${k}`}
              src={sp.src}
              alt=""
              aria-hidden
              draggable={false}
              className={`pointer-events-none absolute select-none${sp.sh > 100 ? " town-sway" : ""}`}
              style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, height: h, zIndex: depth(c, r) + 1, transformOrigin: "bottom center", filter: "drop-shadow(0 4px 3px rgba(60,42,26,0.14))" }}
            />
          );
        })}

        <BuildingTile col={0} row={0} obj={SP.cottage} label="ピコのいえ" href="/pico" i={0} />
        <BuildingTile col={4} row={0} obj={SP.market} label="アイデアいちば" href="/explore" i={1} />
        <BuildingTile col={0} row={4} obj={SP.library} label="がくしゅうかん" href="/learn" i={2} scaleMul={0.78} />
        {business ? (
          <BuildingTile col={4} row={4} obj={SP.shop} label="わたしのおみせ" href="/business" i={3} />
        ) : (
          <LotTile col={4} row={4} label="あきち" href="/explore" i={3} />
        )}

        {/* ピコ patrols the streets with a name tag */}
        <div className="town-pico absolute left-0 top-0" style={{ zIndex: 1000 }}>
          <div className="-translate-x-1/2 -translate-y-[70%]">
            <Link href="/pico" aria-label="ピコとはなす" className="town-pico-bob flex flex-col items-center active:scale-90" style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}>
              <span className="mb-0.5 inline-block rounded-full bg-[#3A2A1A]/85 px-2 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm">ピコ</span>
              <PicoAvatar size={46} mood="happy" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pico-walk { ${picoFrames.join(" ")} }
        @keyframes town-bob { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
        @keyframes town-pop { 0% { opacity: 0; transform: translateY(8px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes town-sway { 0%,100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
        @keyframes town-cloud-1 { 0% { left: -22%; } 100% { left: 118%; } }
        @keyframes town-cloud-2 { 0% { left: -18%; } 100% { left: 116%; } }
        @keyframes town-bird { 0% { left: -12%; top: 16%; } 50% { top: 9%; } 100% { left: 116%; top: 15%; } }
        @keyframes town-bird-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.55); } }
        @keyframes town-bfly { 0% { transform: translate(0,0); } 25% { transform: translate(40px,-26px); } 50% { transform: translate(80px,12px); } 75% { transform: translate(30px,34px); } 100% { transform: translate(0,0); } }
        @keyframes town-bfly-wl { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.3); } }
        @keyframes town-bfly-wr { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.3); } }
        @keyframes town-cat { 0% { left: 10%; transform: scaleX(1); } 47% { left: 60%; transform: scaleX(1); } 50% { left: 60%; transform: scaleX(-1); } 97% { left: 10%; transform: scaleX(-1); } 100% { left: 10%; transform: scaleX(1); } }
        @keyframes town-cat-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes town-twinkle { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes town-celestial { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }

        .town-pico { animation: pico-walk ${(PICO_PATH.length * 1.25).toFixed(0)}s linear infinite; }
        .town-pico-bob { animation: town-bob 0.55s ease-in-out infinite; }
        .town-pop { animation: town-pop 0.5s ease both; }
        .town-sway { animation: town-sway 4.5s ease-in-out infinite; }
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
          .town-pico { transform: translate(${first.x.toFixed(0)}px, ${first.y.toFixed(0)}px); }
        }
      `}</style>
    </div>
  );
}
