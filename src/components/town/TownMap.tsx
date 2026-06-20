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

/* ---- isometric grid maths (design space) ---- */
const SRC_TW = 257;
const TW = 112;
const TH = (TW * 129) / 257;
const S = TW / SRC_TW;

const N = 7; // 7x7 grid
const ORIGIN_X = (N - 1) * (TW / 2);
const ORIGIN_Y = 168;
const DW = (N - 1 + N - 1) * (TW / 2) + TW;
const DH = ORIGIN_Y + (N - 1 + N - 1) * (TH / 2) + TH + 36;

function tilePos(col: number, row: number) {
  return { x: ORIGIN_X + (col - row) * (TW / 2), y: ORIGIN_Y + (col + row) * (TH / 2) };
}
function cellCenter(col: number, row: number) {
  const p = tilePos(col, row);
  return { x: p.x + TW / 2, y: p.y + TH / 2 };
}
const depth = (col: number, row: number) => (col + row) * 2;

const isRoad = (c: number, r: number) => c === 3 || r === 3;

/* ---- sprites (source px) ---- */
const SP = {
  cottage: { src: "/town/cottage.png", w: 225, h: 193 },
  market: { src: "/town/market.png", w: 261, h: 203 },
  library: { src: "/town/library.png", w: 425, h: 345 },
  shop: { src: "/town/shop.png", w: 225, h: 193 },
  houseA: { src: "/town/house-a.png", w: 225, h: 193 },
  houseB: { src: "/town/house-b.png", w: 253, h: 174 },
  houseC: { src: "/town/house-c.png", w: 241, h: 185 },
  houseD: { src: "/town/house-d.png", w: 241, h: 185 },
  houseE: { src: "/town/house-e.png", w: 249, h: 221 },
  apartment: { src: "/town/apartment.png", w: 425, h: 345 },
  tree1: { src: "/town/tree-01.png", w: 139, h: 210 },
  tree2: { src: "/town/tree-02.png", w: 133, h: 193 },
  tree3: { src: "/town/tree-03.png", w: 142, h: 209 },
  tree4: { src: "/town/tree-04.png", w: 138, h: 209 },
  tree5: { src: "/town/tree-05.png", w: 134, h: 193 },
  bush1: { src: "/town/bush-1.png", w: 69, h: 53 },
  bush2: { src: "/town/bush-2.png", w: 53, h: 42 },
  fpink: { src: "/town/flowers-pink.png", w: 24, h: 13 },
  fyellow: { src: "/town/flowers-yellow.png", w: 24, h: 13 },
  forange: { src: "/town/flowers-orange.png", w: 24, h: 13 },
  hydrant: { src: "/town/prop-hydrant.png", w: 18, h: 24 },
  mailbox: { src: "/town/prop-mailbox.png", w: 26, h: 34 },
  lamp: { src: "/town/prop-lamp.png", w: 77, h: 138 },
  pool: { src: "/town/prop-pool.png", w: 105, h: 68 },
  carP: { src: "/town/car-2.png", w: 112, h: 73 },
} as const;
type SpriteKey = keyof typeof SP;

// decorative (non-interactive) buildings: [col,row,key,scaleMul?]
const BLD: [number, number, SpriteKey, number?][] = [
  [0, 0, "houseA"], [4, 0, "houseE"], [6, 0, "houseB"],
  [0, 2, "houseC"], [6, 4, "houseC"],
  [0, 6, "houseD"], [4, 6, "houseC"], [6, 6, "apartment", 0.8],
];

// decor + props: [col,row,key,scaleMul?]
const DECOR: [number, number, SpriteKey, number?][] = [
  [2, 0, "fpink"], [0, 1, "mailbox"], [2, 1, "tree1"], [4, 1, "tree3"], [6, 1, "carP"],
  [2, 2, "fyellow"], [4, 2, "lamp"], [6, 2, "tree2"],
  [0, 4, "tree5"], [2, 4, "tree4"], [4, 4, "lamp"],
  [0, 5, "forange"], [2, 5, "bush1"], [4, 5, "tree1"], [6, 5, "pool"],
  [2, 6, "tree3"],
];

// ピコ patrols the cross
const PICO_PATH: [number, number][] = [
  [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [3, 1], [3, 2], [3, 3],
  [4, 3], [5, 3], [6, 3], [5, 3], [4, 3], [3, 3], [3, 4], [3, 5], [3, 6], [3, 5], [3, 4], [3, 3],
];

function pathFrames(cells: [number, number][], yOff: number, fade: boolean) {
  const n = cells.length;
  const out = cells.map((c, i) => {
    const ctr = cellCenter(c[0], c[1]);
    const pct = ((i / n) * 100).toFixed(2);
    const op = fade ? `; opacity: ${i === 0 ? 0 : i >= n - 1 ? 0 : 1}` : "";
    return `${pct}% { transform: translate(${ctr.x.toFixed(1)}px, ${(ctr.y - yOff).toFixed(1)}px)${op}; }`;
  });
  const f = cellCenter(cells[0][0], cells[0][1]);
  out.push(`100% { transform: translate(${f.x.toFixed(1)}px, ${(f.y - yOff).toFixed(1)}px)${fade ? "; opacity: 0" : ""}; }`);
  return out.join(" ");
}

function BuildingTile({ col, row, sp, label, href, i, scaleMul = 1 }: { col: number; row: number; sp: { src: string; w: number; h: number }; label: string; href: string; i: number; scaleMul?: number }) {
  const p = tilePos(col, row);
  const w = sp.w * S * scaleMul;
  const h = sp.h * S * scaleMul;
  return (
    <Link href={href} aria-label={label} className="town-pop group absolute active:scale-95" style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, zIndex: depth(col, row) + 2, animationDelay: `${i * 80}ms`, transformOrigin: "bottom center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sp.src} alt={label} draggable={false} className="select-none transition-transform duration-200 group-hover:-translate-y-1" style={{ width: w, height: h, filter: "drop-shadow(0 6px 5px rgba(60,42,26,0.2))" }} />
      <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm">{label}</span>
    </Link>
  );
}

function LotTile({ col, row, label, href, i }: { col: number; row: number; label: string; href: string; i: number }) {
  const p = tilePos(col, row);
  return (
    <Link href={href} aria-label={label} className="town-pop group absolute flex flex-col items-center active:scale-95" style={{ left: p.x + TW * 0.18, top: p.y + TH * 0.08, width: TW * 0.64, zIndex: depth(col, row) + 2, animationDelay: `${i * 80}ms`, transformOrigin: "bottom center" }}>
      <span className="flex w-full items-center justify-center rounded-md border-2 border-dashed border-[#8a7a5a]/70 bg-white/20" style={{ height: TH * 0.7 }}>
        <span className="material-symbols-outlined text-[22px] text-[#6a5a3a]">add</span>
      </span>
      <span className="mt-0.5 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm">{label}</span>
    </Link>
  );
}

const Cat = ({ cls, bottom, dur }: { cls: string; bottom: string; dur: number }) => (
  <div className={`${cls} pointer-events-none absolute`} style={{ bottom, zIndex: 900, animationDuration: `${dur}s` }} aria-hidden>
    <div className="town-cat-bob" style={{ filter: "drop-shadow(0 3px 2px rgba(60,42,26,0.2))" }}>
      <svg width="34" height="24" viewBox="0 0 40 28" fill="none">
        <path d="M5 16 q-6 -3 -5 -11" stroke="#E8A85C" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="17" cy="17" rx="12" ry="7" fill="#E8A85C" />
        <rect x="11" y="21" width="2.6" height="6" rx="1.3" fill="#D8954A" />
        <rect x="21" y="21" width="2.6" height="6" rx="1.3" fill="#D8954A" />
        <circle cx="29" cy="12" r="6" fill="#E8A85C" />
        <path d="M24 6.5 l1.4 4.2 -4 -0.6z" fill="#E8A85C" /><path d="M31 6.5 l2 3.6 -3.6 0.6z" fill="#E8A85C" />
        <circle cx="30.5" cy="12" r="1" fill="#3A2A1A" /><circle cx="33.6" cy="13" r="0.8" fill="#FF9E9E" />
      </svg>
    </div>
  </div>
);

const Bird = ({ cls, dur }: { cls: string; dur: number }) => (
  <div className={`${cls} pointer-events-none absolute`} style={{ zIndex: 5, animationDuration: `${dur}s` }} aria-hidden>
    <div className="town-bird-flap">
      <svg width="24" height="15" viewBox="0 0 26 16" fill="none">
        <ellipse cx="13" cy="9" rx="5" ry="3.2" fill="#8FBEEA" /><circle cx="18" cy="7" r="2.4" fill="#8FBEEA" />
        <path d="M20 6.4 l3 -1 -2 2.2z" fill="#FFB347" /><circle cx="19" cy="6.6" r="0.6" fill="#3A2A1A" />
        <path d="M9 8 q-5 -5 -8 -2" stroke="#8FBEEA" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const Butterfly = ({ left, top, dur }: { left: string; top: string; dur: number }) => (
  <div className="town-bfly pointer-events-none absolute" style={{ left, top, zIndex: 800, animationDuration: `${dur}s` }} aria-hidden>
    <svg width="16" height="14" viewBox="0 0 20 18" fill="none">
      <ellipse className="town-bfly-wl" cx="7" cy="9" rx="5" ry="7" fill="#FF9ECF" />
      <ellipse className="town-bfly-wr" cx="13" cy="9" rx="5" ry="7" fill="#FFC36E" />
      <rect x="9.3" y="3" width="1.4" height="12" rx="0.7" fill="#3A2A1A" />
    </svg>
  </div>
);

export function TownMap({ business }: { business: Business }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [night, setNight] = useState<boolean | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setNight(h >= 19 || h < 6);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / DW, el.clientHeight / DH, 1.2));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isNight = !!night;

  // movers
  const picoKf = pathFrames(PICO_PATH, 6, false);
  const carKf = pathFrames([[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3]], 4, true);
  const ped1Kf = pathFrames([[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6]], 20, true);
  const ped2Kf = pathFrames([[3, 6], [3, 5], [3, 4], [3, 3], [3, 2], [3, 1], [3, 0]], 20, true);
  const picoStart = cellCenter(PICO_PATH[0][0], PICO_PATH[0][1]);

  // ground/road tiles
  const tiles = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const p = tilePos(c, r);
    tiles.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img key={`g${c}-${r}`} src={isRoad(c, r) ? "/town/road.png" : "/town/ground.png"} alt="" aria-hidden draggable={false} className="pointer-events-none absolute select-none" style={{ left: p.x, top: p.y, width: TW + 1, height: TH + 1, zIndex: depth(c, r) }} />
    );
  }

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden" style={{ background: isNight ? "linear-gradient(180deg, #2B2E4A 0%, #4A4E73 30%, #6E8E5A 64%, #5F8050 100%)" : "linear-gradient(180deg, #FFF1DE 0%, #FBE7C7 20%, #CFE9AE 52%, #BFE0A0 100%)", transition: "background 1.2s ease" }}>
      <div className="town-celestial pointer-events-none absolute right-7 top-5 h-14 w-14 rounded-full" style={{ background: isNight ? "radial-gradient(circle, #FFFDF0 0%, #F4E8B0 58%, transparent 70%)" : "radial-gradient(circle, #FFE9A8 0%, #FFD36E 55%, transparent 70%)", zIndex: 4 }} aria-hidden />

      {isNight ? (
        ["14%,12%,0s", "34%,8%,.6s", "58%,14%,1.1s", "80%,10%,.3s", "24%,18%,.9s"].map((s, k) => {
          const [l, t, d] = s.split(",");
          return <span key={k} className="town-twinkle pointer-events-none absolute text-[10px]" style={{ left: l, top: t, zIndex: 4, animationDelay: d }} aria-hidden>✦</span>;
        })
      ) : (
        <>
          <div className="town-cloud town-cloud-1 pointer-events-none absolute h-6 w-16 rounded-full bg-white/70" style={{ top: "11%", zIndex: 3 }} aria-hidden />
          <div className="town-cloud town-cloud-2 pointer-events-none absolute h-5 w-12 rounded-full bg-white/60" style={{ top: "19%", zIndex: 3 }} aria-hidden />
          <Bird cls="town-bird" dur={17} />
          <Bird cls="town-bird town-bird-2" dur={23} />
          <Butterfly left="26%" top="32%" dur={9} />
          <Butterfly left="62%" top="44%" dur={11} />
        </>
      )}

      <p className="pointer-events-none absolute left-1/2 top-3 z-[5] -translate-x-1/2 rounded-full bg-white/70 px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#6a5638]">エグチタウン {isNight ? "🌙" : "☀️"}</p>
      <button type="button" onClick={() => setNight((n) => !n)} className="absolute left-3 top-3 z-[6] flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6a5638] shadow-sm active:scale-90" aria-label={isNight ? "昼にする" : "夜にする"}>
        <span className="material-symbols-outlined text-[18px]">{isNight ? "light_mode" : "dark_mode"}</span>
      </button>

      <Cat cls="town-cat" bottom="11%" dur={26} />
      <Cat cls="town-cat town-cat-2" bottom="7%" dur={34} />

      {/* scaled isometric town */}
      <div className="absolute left-1/2 top-1/2" style={{ width: DW, height: DH, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center" }}>
        {tiles}

        {DECOR.map(([c, r, key, m], k) => {
          const sp = SP[key];
          const w = sp.w * S * (m ?? 1);
          const h = sp.h * S * (m ?? 1);
          const p = tilePos(c, r);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`d${k}`} src={sp.src} alt="" aria-hidden draggable={false} className={`pointer-events-none absolute select-none${sp.h > 150 ? " town-sway" : ""}`} style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, height: h, zIndex: depth(c, r) + 1, transformOrigin: "bottom center", filter: "drop-shadow(0 4px 3px rgba(60,42,26,0.14))" }} />
          );
        })}

        {BLD.map(([c, r, key, m], k) => {
          const sp = SP[key];
          const w = sp.w * S * (m ?? 1);
          const h = sp.h * S * (m ?? 1);
          const p = tilePos(c, r);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`b${k}`} src={sp.src} alt="" aria-hidden draggable={false} className="pointer-events-none absolute select-none" style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, height: h, zIndex: depth(c, r) + 1, filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.18))" }} />
          );
        })}

        {/* moving car + pedestrians */}
        <div className="town-mover town-car absolute left-0 top-0" style={{ zIndex: 500 }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/town/car-1.png" alt="" draggable={false} className="-translate-x-1/2 -translate-y-1/2 select-none" style={{ width: 112 * S, height: 74 * S, filter: "drop-shadow(0 3px 2px rgba(60,42,26,0.2))" }} />
        </div>
        <div className="town-mover town-ped1 absolute left-0 top-0" style={{ zIndex: 520 }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/town/person-1.png" alt="" draggable={false} className="town-pico-bob -translate-x-1/2 -translate-y-full select-none" style={{ width: 25 * S * 1.5, height: 40 * S * 1.5, filter: "drop-shadow(0 2px 2px rgba(60,42,26,0.2))" }} />
        </div>
        <div className="town-mover town-ped2 absolute left-0 top-0" style={{ zIndex: 520 }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/town/person-2.png" alt="" draggable={false} className="town-pico-bob -translate-x-1/2 -translate-y-full select-none" style={{ width: 24 * S * 1.5, height: 39 * S * 1.5, filter: "drop-shadow(0 2px 2px rgba(60,42,26,0.2))" }} />
        </div>

        {/* civic buildings (interactive) */}
        <BuildingTile col={1} row={1} sp={SP.cottage} label="ピコのいえ" href="/pico" i={0} />
        <BuildingTile col={5} row={1} sp={SP.market} label="アイデアいちば" href="/explore" i={1} />
        <BuildingTile col={1} row={5} sp={SP.library} label="がくしゅうかん" href="/learn" i={2} scaleMul={0.78} />
        {business ? <BuildingTile col={5} row={5} sp={SP.shop} label="わたしのおみせ" href="/business" i={3} /> : <LotTile col={5} row={5} label="あきち" href="/explore" i={3} />}

        {/* ピコ patrols with name tag */}
        <div className="town-pico absolute left-0 top-0" style={{ zIndex: 1000 }}>
          <div className="-translate-x-1/2 -translate-y-[70%]">
            <Link href="/pico" aria-label="ピコとはなす" className="town-pico-bob flex flex-col items-center active:scale-90" style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}>
              <span className="mb-0.5 inline-block rounded-full bg-[#3A2A1A]/85 px-2 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm">ピコ</span>
              <PicoAvatar size={44} mood="happy" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pico-walk { ${picoKf} }
        @keyframes town-car-drive { ${carKf} }
        @keyframes town-ped1 { ${ped1Kf} }
        @keyframes town-ped2 { ${ped2Kf} }
        @keyframes town-bob { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes town-pop { 0% { opacity: 0; transform: translateY(8px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes town-sway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        @keyframes town-cloud-1 { 0% { left: -22%; } 100% { left: 118%; } }
        @keyframes town-cloud-2 { 0% { left: -18%; } 100% { left: 116%; } }
        @keyframes town-bird { 0% { left: -12%; top: 16%; } 50% { top: 9%; } 100% { left: 116%; top: 15%; } }
        @keyframes town-bird-2 { 0% { left: 116%; top: 22%; } 50% { top: 13%; } 100% { left: -12%; top: 24%; } }
        @keyframes town-bird-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.55); } }
        @keyframes town-bfly { 0% { transform: translate(0,0); } 25% { transform: translate(36px,-24px); } 50% { transform: translate(72px,10px); } 75% { transform: translate(28px,30px); } 100% { transform: translate(0,0); } }
        @keyframes town-bfly-wl { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.3); } }
        @keyframes town-bfly-wr { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(0.3); } }
        @keyframes town-cat { 0% { left: 8%; transform: scaleX(1); } 47% { left: 64%; transform: scaleX(1); } 50% { left: 64%; transform: scaleX(-1); } 97% { left: 8%; transform: scaleX(-1); } 100% { left: 8%; transform: scaleX(1); } }
        @keyframes town-cat-2 { 0% { left: 70%; transform: scaleX(-1); } 47% { left: 20%; transform: scaleX(-1); } 50% { left: 20%; transform: scaleX(1); } 97% { left: 70%; transform: scaleX(1); } 100% { left: 70%; transform: scaleX(-1); } }
        @keyframes town-cat-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes town-twinkle { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        @keyframes town-celestial { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }

        .town-pico { animation: pico-walk ${(PICO_PATH.length * 1.15).toFixed(0)}s linear infinite; }
        .town-car { animation: town-car-drive 14s linear infinite; }
        .town-ped1 { animation: town-ped1 18s linear infinite; }
        .town-ped2 { animation: town-ped2 21s linear infinite; }
        .town-pico-bob { animation: town-bob 0.55s ease-in-out infinite; }
        .town-pop { animation: town-pop 0.5s ease both; }
        .town-sway { animation: town-sway 4.5s ease-in-out infinite; }
        .town-cloud-1 { animation: town-cloud-1 48s linear infinite; }
        .town-cloud-2 { animation: town-cloud-2 64s linear infinite; }
        .town-bird { animation: town-bird 17s linear infinite; }
        .town-bird-2 { animation-name: town-bird-2; }
        .town-bird-flap { animation: town-bird-flap 0.4s ease-in-out infinite; }
        .town-bfly { animation: town-bfly 9s ease-in-out infinite; }
        .town-bfly-wl { transform-origin: right center; animation: town-bfly-wl 0.3s ease-in-out infinite; }
        .town-bfly-wr { transform-origin: left center; animation: town-bfly-wr 0.3s ease-in-out infinite; }
        .town-cat { animation: town-cat 26s ease-in-out infinite; }
        .town-cat-2 { animation-name: town-cat-2; }
        .town-cat-bob { animation: town-cat-bob 0.5s ease-in-out infinite; }
        .town-twinkle { animation: town-twinkle 2.4s ease-in-out infinite; color: #FFF6D8; }
        .town-celestial { animation: town-celestial 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .town-pico, .town-car, .town-ped1, .town-ped2, .town-pico-bob, .town-sway, .town-cloud-1, .town-cloud-2, .town-bird, .town-bird-flap, .town-bfly, .town-bfly-wl, .town-bfly-wr, .town-cat, .town-cat-bob, .town-twinkle, .town-celestial { animation: none; }
          .town-pop { animation: none; opacity: 1; }
          .town-pico { transform: translate(${picoStart.x.toFixed(0)}px, ${picoStart.y.toFixed(0)}px); }
          .town-car, .town-ped1, .town-ped2 { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
