"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PicoAvatar } from "@/components/journey/Pico";

type Business = { id: string; idea: string; current_stage: string; status: string } | null;

/* ---- isometric grid maths ---- */
const SRC_TW = 257;
const TW = 132;
const TH = (TW * 129) / 257;
const S = TW / SRC_TW;
const N = 8; // big tiled field; edges hidden by clouds
const ORIGIN_X = (N - 1) * (TW / 2);
const ORIGIN_Y = 200;
const DW = (N - 1 + N - 1) * (TW / 2) + TW;
const DH = ORIGIN_Y + (N - 1 + N - 1) * (TH / 2) + TH + 60;

const tilePos = (c: number, r: number) => ({ x: ORIGIN_X + (c - r) * (TW / 2), y: ORIGIN_Y + (c + r) * (TH / 2) });
const cellCenter = (c: number, r: number) => { const p = tilePos(c, r); return { x: p.x + TW / 2, y: p.y + TH / 2 }; };
const depth = (c: number, r: number) => (c + r) * 2;
const isRoad = (c: number, r: number) => c === 3 || r === 3;

/* ---- sprites ---- */
const SP = {
  cottage: { src: "/town/cottage.png", w: 225, h: 193 },
  market: { src: "/town/market.png", w: 261, h: 203 },
  library: { src: "/town/library.png", w: 425, h: 345 },
  shop: { src: "/town/shop.png", w: 225, h: 193 },
  houseA: { src: "/town/house-a.png", w: 225, h: 193 },
  houseB: { src: "/town/house-b.png", w: 253, h: 174 },
  houseC: { src: "/town/house-c.png", w: 241, h: 185 },
  houseD: { src: "/town/house-d.png", w: 241, h: 185 },
  tree1: { src: "/town/tree-01.png", w: 139, h: 210 },
  tree2: { src: "/town/tree-02.png", w: 133, h: 193 },
  tree3: { src: "/town/tree-03.png", w: 142, h: 209 },
  tree4: { src: "/town/tree-04.png", w: 138, h: 209 },
  fpink: { src: "/town/flowers-pink.png", w: 24, h: 13 },
} as const;
type SKey = keyof typeof SP;

type Civic = { col: number; row: number; key: SKey; label: string; href: string; scaleMul?: number };
const CIVIC: Civic[] = [
  { col: 2, row: 2, key: "cottage", label: "ピコのいえ", href: "/pico" },
  { col: 5, row: 2, key: "market", label: "アイデアいちば", href: "/explore" },
  { col: 2, row: 5, key: "library", label: "がくしゅうかん", href: "/learn", scaleMul: 0.7 },
];
const CIVIC_SET = new Set(CIVIC.map((b) => `${b.col},${b.row}`).concat(["5,5"]));

const HOUSES: SKey[] = ["houseA", "houseB", "houseC", "houseD"];
const TREES: SKey[] = ["tree1", "tree2", "tree3", "tree4"];

// deterministic filler: houses + trees across all non-civic, non-road cells
type Filler = { c: number; r: number; sp: SKey };
const FILLER: Filler[] = [];
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
  if (CIVIC_SET.has(`${c},${r}`) || isRoad(c, r)) continue;
  const m = (c * 3 + r * 5) % 7;
  if (m === 0) FILLER.push({ c, r, sp: HOUSES[(c + r) % 4] });
  else if (m === 2 || m === 5) FILLER.push({ c, r, sp: TREES[(c * 2 + r) % 4] });
  else if (m === 4) FILLER.push({ c, r, sp: "fpink" });
}

// wander/road cells
const ROAD_CELLS: [number, number][] = [];
for (let i = 0; i < N; i++) { ROAD_CELLS.push([3, i]); if (i !== 3) ROAD_CELLS.push([i, 3]); }

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function TownMap({ business }: { business: Business }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const moversRef = useRef<HTMLDivElement[]>([]);
  const [scale, setScale] = useState(0.8);
  const [night, setNight] = useState<boolean | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [picoTap, setPicoTap] = useState(false);

  useEffect(() => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    // cover the screen, then clouds hide the overflowing edges
    const fit = () => setScale(Math.max(el.clientWidth / DW, el.clientHeight / DH) * 1.04);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isNight = !!night;
  const cloud = isNight ? "rgba(214,221,240,0.96)" : "rgba(255,255,255,0.96)";
  const peopleCount = isNight ? 1 : 3;
  const carCount = isNight ? 0 : 1;

  const movers: { kind: "pico" | "person" | "car"; src?: string; w: number; h: number; speed: number; cells: [number, number][] }[] = [
    { kind: "pico", w: 44, h: 44, speed: isNight ? 26 : 42, cells: ROAD_CELLS },
  ];
  for (let i = 0; i < peopleCount; i++) movers.push({ kind: "person", src: `/town/person-${i + 1}.png`, w: 25 * S * 1.5, h: 40 * S * 1.5, speed: 32 + i * 6, cells: ROAD_CELLS });
  for (let i = 0; i < carCount; i++) movers.push({ kind: "car", src: "/town/car-1.png", w: 112 * S, h: 74 * S, speed: 72, cells: ROAD_CELLS });

  useEffect(() => {
    moversRef.current.length = movers.length;
    const states = movers.map((m) => {
      const s = cellCenter(...pick(m.cells));
      const t = cellCenter(...pick(m.cells));
      return { x: s.x, y: s.y, tx: t.x, ty: t.y, pause: 0, face: 1, cells: m.cells, speed: m.speed, kind: m.kind };
    });
    let raf = 0; let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(60, t - last); last = t;
      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        if (t >= s.pause) {
          const dx = s.tx - s.x, dy = s.ty - s.y; const d = Math.hypot(dx, dy) || 1; const step = (s.speed * dt) / 1000;
          if (d <= step) { s.x = s.tx; s.y = s.ty; s.pause = t + 500 + Math.random() * 1800; const nt = cellCenter(...pick(s.cells)); s.face = nt.x < s.x ? -1 : 1; s.tx = nt.x; s.ty = nt.y; }
          else { s.x += (dx / d) * step; s.y += (dy / d) * step; s.face = dx < 0 ? -1 : 1; }
        }
        const el = moversRef.current[i];
        if (el) el.style.transform = s.kind === "pico" ? `translate(${s.x}px,${s.y}px)` : `translate(${s.x}px,${s.y}px) scaleX(${s.face})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNight]);

  const go = (href: string) => { if (tapped) return; setTapped(href); window.setTimeout(() => router.push(href), 360); };
  const tapPico = () => { if (picoTap) return; setPicoTap(true); window.setTimeout(() => router.push("/pico"), 720); };

  const buildings: Civic[] = business ? [...CIVIC, { col: 5, row: 5, key: "shop", label: "わたしのおみせ", href: "/business" }] : CIVIC;

  const tiles = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const p = tilePos(c, r);
    tiles.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img key={`g${c}-${r}`} src={isRoad(c, r) ? "/town/road.png" : "/town/ground.png"} alt="" aria-hidden draggable={false} className="pointer-events-none absolute select-none" style={{ left: p.x, top: p.y, width: TW + 1, height: TH + 1, zIndex: depth(c, r) }} />
    );
  }

  const label = (text: string) => (
    <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[15px] font-extrabold text-[#4a3a28] shadow">{text}</span>
  );

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden" style={{ background: isNight ? "linear-gradient(180deg,#26314F 0%,#3E4A78 30%,#5C6E90 60%,#6E8E5A 100%)" : "linear-gradient(180deg,#BFE0F5 0%,#D8EAF6 28%,#E8F2E0 55%,#CDE9B8 100%)", transition: "background 1.2s ease" }}>
      {/* scaled isometric town (covers the screen) */}
      <div className="absolute left-1/2 top-1/2" style={{ width: DW, height: DH, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center", zIndex: 20, filter: "saturate(0.97) brightness(1.02)" }}>
        {tiles}

        {FILLER.map(({ c, r, sp: key }, k) => {
          const sp = SP[key]; const w = sp.w * S; const h = sp.h * S; const p = tilePos(c, r);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`f${k}`} src={sp.src} alt="" aria-hidden draggable={false} className={`pointer-events-none absolute select-none${sp.h > 150 ? " town-sway" : ""}`} style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, height: h, zIndex: depth(c, r) + 1, transformOrigin: "bottom center", filter: "drop-shadow(0 5px 5px rgba(60,42,26,0.16))" }} />
          );
        })}

        {buildings.map((b, k) => {
          const sp = SP[b.key]; const w = sp.w * S * (b.scaleMul ?? 1); const h = sp.h * S * (b.scaleMul ?? 1); const p = tilePos(b.col, b.row); const active = tapped === b.href;
          return (
            <button key={`c${k}`} type="button" onClick={() => go(b.href)} aria-label={b.label} className={`town-pop group absolute ${active ? "town-bounce" : ""}`} style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, zIndex: depth(b.col, b.row) + 3, animationDelay: `${k * 80}ms`, transformOrigin: "bottom center" }}>
              {label(b.label)}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sp.src} alt="" draggable={false} className="select-none transition-transform duration-200 group-hover:-translate-y-1" style={{ width: w, height: h, filter: "drop-shadow(0 8px 7px rgba(60,42,26,0.24))" }} />
              {isNight && <span className="pointer-events-none absolute rounded-full" style={{ left: "50%", top: "55%", width: w * 0.5, height: h * 0.4, transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(255,220,140,0.55),transparent 70%)" }} />}
              {active && ["-10,-6", "10,-4", "0,-12", "-6,4"].map((s, j) => { const [x, y] = s.split(","); return <span key={j} className="town-spark pointer-events-none absolute left-1/2 top-1/3 text-[12px]" style={{ animationDelay: `${j * 40}ms`, "--tx": `${x}px`, "--ty": `${y}px` } as React.CSSProperties}>✦</span>; })}
            </button>
          );
        })}

        {!business && (() => {
          const p = tilePos(5, 5); const active = tapped === "/explore";
          return (
            <button type="button" onClick={() => go("/explore")} aria-label="あきち" className={`town-pop absolute flex flex-col items-center ${active ? "town-bounce" : ""}`} style={{ left: p.x + TW * 0.18, top: p.y + TH * 0.06, width: TW * 0.64, zIndex: depth(5, 5) + 3, transformOrigin: "bottom center" }}>
              {label("あきち")}
              <span className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-[#8a7a5a]/70 bg-white/20" style={{ height: TH * 0.7 }}><span className="material-symbols-outlined text-[26px] text-[#6a5a3a]">add</span></span>
            </button>
          );
        })()}

        {movers.map((m, i) => (
          <div key={`m${i}`} ref={(el) => { if (el) moversRef.current[i] = el; }} className="absolute left-0 top-0" style={{ zIndex: 9000 + i, willChange: "transform" }}>
            {m.kind === "pico" ? (
              <div className={`-translate-x-1/2 -translate-y-[70%] ${picoTap ? "town-hop" : ""}`}>
                <button type="button" onClick={tapPico} aria-label="ピコとはなす" className="flex flex-col items-center active:scale-90" style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}>
                  {picoTap && <span className="town-bubble absolute -top-7 whitespace-nowrap rounded-2xl bg-white px-2 py-1 text-[12px] font-bold text-[#5a4a38] shadow">やあ！👋</span>}
                  <span className="mb-0.5 inline-block rounded-full bg-[#3A2A1A]/85 px-2 py-0.5 text-[11px] font-extrabold leading-none text-white shadow-sm">ピコ</span>
                  <PicoAvatar size={44} mood="happy" />
                </button>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.src} alt="" aria-hidden draggable={false} className="town-bob -translate-x-1/2 -translate-y-full select-none" style={{ width: m.w, height: m.h, filter: "drop-shadow(0 2px 2px rgba(60,42,26,0.2))" }} />
            )}
          </div>
        ))}
      </div>

      {/* ---- clouds feathering all 4 edges ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26%]" style={{ background: `linear-gradient(to bottom, ${cloud}, transparent)`, zIndex: 50 }} aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%]" style={{ background: `linear-gradient(to top, ${cloud}, transparent)`, zIndex: 50 }} aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%]" style={{ background: `linear-gradient(to right, ${cloud}, transparent)`, zIndex: 50 }} aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%]" style={{ background: `linear-gradient(to left, ${cloud}, transparent)`, zIndex: 50 }} aria-hidden />
      {/* puffy cloud blobs along the edges */}
      {["6,5,90,40", "30,3,120,46", "60,4,110,42", "84,6,92,40", "4,80,96,40", "34,90,120,44", "64,88,110,42", "88,82,90,40", "2,40,70,60", "92,46,70,60"].map((s, k) => {
        const [l, t, w, h] = s.split(",").map(Number);
        return <div key={k} className="town-cloud-drift pointer-events-none absolute rounded-full" style={{ left: `${l}%`, top: `${t}%`, width: w, height: h, background: cloud, filter: "blur(6px)", zIndex: 51, animationDelay: `${k * 0.7}s` }} aria-hidden />;
      })}

      {/* sun / moon, above clouds */}
      <div className="town-celestial pointer-events-none absolute right-8 top-7 h-14 w-14 rounded-full" style={{ background: isNight ? "radial-gradient(circle,#FFFDF0 0%,#F4E8B0 58%,transparent 70%)" : "radial-gradient(circle,#FFF1C4 0%,#FFD98C 55%,transparent 72%)", zIndex: 55 }} aria-hidden />
      {isNight && ["16,8,0s", "40,6,.6s", "66,10,1.1s", "86,7,.3s"].map((s, k) => { const [l, t, d] = s.split(","); return <span key={k} className="town-twinkle pointer-events-none absolute text-[10px]" style={{ left: `${l}%`, top: `${t}%`, zIndex: 55, animationDelay: d }} aria-hidden>✦</span>; })}

      {/* title + day/night toggle */}
      <p className="pointer-events-none absolute left-1/2 top-3 z-[60] -translate-x-1/2 rounded-full bg-white/80 px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#6a5638]">エグチタウン {isNight ? "🌙" : "☀️"}</p>
      <button type="button" onClick={() => setNight((n) => !n)} className="absolute left-3 top-3 z-[60] flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-[#6a5638] shadow-sm active:scale-90" aria-label={isNight ? "昼にする" : "夜にする"}>
        <span className="material-symbols-outlined text-[18px]">{isNight ? "light_mode" : "dark_mode"}</span>
      </button>

      <style>{`
        @keyframes town-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes town-pop { 0%{opacity:0;transform:translateY(8px) scale(.92)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes town-bounce { 0%,100%{transform:translateY(0) scale(1)} 35%{transform:translateY(-10px) scale(1.06)} 70%{transform:translateY(0) scale(.98)} }
        @keyframes town-spark { 0%{opacity:1;transform:translate(0,0) scale(.4);color:#FFD36E} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(1.2);color:#FF9ECF} }
        @keyframes town-hop { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-12px)} 60%{transform:translateY(0)} }
        @keyframes town-bubble { 0%{opacity:0;transform:translateY(4px) scale(.8)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes town-sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes town-cloud-drift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(10px)} }
        @keyframes town-twinkle { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes town-celestial { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        .town-bob{animation:town-bob .5s ease-in-out infinite}
        .town-pop{animation:town-pop .5s ease both}
        .town-bounce{animation:town-bounce .36s ease}
        .town-spark{animation:town-spark .5s ease-out forwards}
        .town-hop{animation:town-hop .7s ease}
        .town-bubble{animation:town-bubble .2s ease both}
        .town-sway{animation:town-sway 4.5s ease-in-out infinite}
        .town-cloud-drift{animation:town-cloud-drift 9s ease-in-out infinite}
        .town-twinkle{animation:town-twinkle 2.4s ease-in-out infinite;color:#FFF6D8}
        .town-celestial{animation:town-celestial 6s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){ .town-bob,.town-sway,.town-cloud-drift,.town-twinkle,.town-celestial{animation:none} .town-pop{animation:none;opacity:1} }
      `}</style>
    </div>
  );
}
