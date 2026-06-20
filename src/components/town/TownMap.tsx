"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PicoAvatar, type PicoMood } from "@/components/journey/Pico";

type Business = { id: string; idea: string; current_stage: string; status: string } | null;

/* ---- isometric grid maths ---- */
const SRC_TW = 257;
const TW = 132;
const TH = (TW * 129) / 257;
const S = TW / SRC_TW;
const N = 21;
const MID = Math.floor(N / 2);
const TOPF = 0.44;
const ORIGIN_X = (N - 1) * (TW / 2);
const ORIGIN_Y = 230;
const DW = (N - 1 + N - 1) * (TW / 2) + TW;
const DH = ORIGIN_Y + (N - 1 + N - 1) * (TH / 2) + TH + 60;

const tilePos = (c: number, r: number) => ({ x: ORIGIN_X + (c - r) * (TW / 2), y: ORIGIN_Y + (c + r) * (TH / 2) });
const cellCenter = (c: number, r: number) => { const p = tilePos(c, r); return { x: p.x + TW / 2, y: p.y + TH / 2 }; };
const depth = (c: number, r: number) => (c + r) * 2;
// a crossroads through the centre: two roads meeting by the buildings, running out to the corners
const isRoad = (c: number, r: number) => c === MID || r === MID;

/* ---- sprites ---- */
const SP = {
  cottage: { src: "/town/cottage.png", w: 225, h: 193 },
  market: { src: "/town/market.png", w: 261, h: 203 },
  library: { src: "/town/library.png", w: 425, h: 345 },
  shop: { src: "/town/shop.png", w: 225, h: 193 },
  tree1: { src: "/town/tree-01.png", w: 139, h: 210 },
  tree2: { src: "/town/tree-02.png", w: 133, h: 193 },
  tree3: { src: "/town/tree-03.png", w: 142, h: 209 },
  tree4: { src: "/town/tree-04.png", w: 138, h: 209 },
  fpink: { src: "/town/flowers-pink.png", w: 24, h: 13 },
  fyellow: { src: "/town/flowers-yellow.png", w: 24, h: 13 },
} as const;
type SKey = keyof typeof SP;

type Civic = { col: number; row: number; key: SKey; label: string; href: string; scaleMul?: number };
const CIVIC: Civic[] = [
  { col: MID - 1, row: MID - 1, key: "cottage", label: "ピコのいえ", href: "/pico" },
  { col: MID + 1, row: MID - 1, key: "market", label: "アイデアいちば", href: "/explore" },
  { col: MID - 1, row: MID + 1, key: "library", label: "がっこう", href: "/learn", scaleMul: 0.7 },
];
const SHOP_CELL: [number, number] = [MID + 1, MID + 1];
const CIVIC_SET = new Set(CIVIC.map((b) => `${b.col},${b.row}`).concat([`${SHOP_CELL[0]},${SHOP_CELL[1]}`]));

const TREES: SKey[] = ["tree1", "tree2", "tree3"]; // green trees only (no autumn orange)
// sparse greenery so the fields stay open
type Filler = { c: number; r: number; sp: SKey };
const FILLER: Filler[] = [];
for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
  if (CIVIC_SET.has(`${c},${r}`) || isRoad(c, r)) continue;
  const m = (c * 3 + r * 5) % 7;
  if (m === 0 || m === 5) FILLER.push({ c, r, sp: TREES[(c * 2 + r) % 3] });
  else if (m === 3) FILLER.push({ c, r, sp: (c + r) % 2 ? "fpink" : "fyellow" });
}

const inWin = (c: number, r: number) => c >= 0 && c < N && r >= 0 && r < N && Math.abs(c - MID) <= 5 && Math.abs(r - MID) <= 5;
const ROAD_CELLS: [number, number][] = [];
const GRASS_CELLS: [number, number][] = [];
for (let r = MID - 5; r <= MID + 5; r++) for (let c = MID - 5; c <= MID + 5; c++) {
  if (!inWin(c, r)) continue;
  if (isRoad(c, r)) ROAD_CELLS.push([c, r]);
  else if (!CIVIC_SET.has(`${c},${r}`)) GRASS_CELLS.push([c, r]);
}
const PICO_CELLS = [...ROAD_CELLS, ...GRASS_CELLS];
// the cross splits the field into 4 quadrants; an animal stays in one so it never crosses a road
const GRASS_Q: [number, number][][] = [
  GRASS_CELLS.filter(([c, r]) => c < MID && r < MID),
  GRASS_CELLS.filter(([c, r]) => c > MID && r < MID),
  GRASS_CELLS.filter(([c, r]) => c < MID && r > MID),
  GRASS_CELLS.filter(([c, r]) => c > MID && r > MID),
];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/* ---- cute critters ---- */
function Critter({ type }: { type: string }) {
  switch (type) {
    case "dog":
      return (<svg width="36" height="26" viewBox="0 0 42 30" fill="none"><path d="M4 16 q-3 -6 1 -9" stroke="#9B6B43" strokeWidth="3" fill="none" strokeLinecap="round" /><ellipse cx="18" cy="18" rx="13" ry="7.5" fill="#A9774B" /><rect x="11" y="22" width="3" height="6.5" rx="1.5" fill="#8B5E37" /><rect x="23" y="22" width="3" height="6.5" rx="1.5" fill="#8B5E37" /><circle cx="31" cy="14" r="6.5" fill="#A9774B" /><path d="M28 9 q-3 1 -2 7 q3 -1 4 -5z" fill="#8B5E37" /><circle cx="33" cy="14" r="1" fill="#3A2A1A" /><circle cx="36" cy="15.5" r="1.2" fill="#3A2A1A" /></svg>);
    case "rabbit":
      return (<svg width="28" height="30" viewBox="0 0 30 34" fill="none"><ellipse cx="14" cy="24" rx="9" ry="6.5" fill="#F2F2F2" /><circle cx="20" cy="17" r="5.5" fill="#F2F2F2" /><ellipse cx="18" cy="7" rx="2" ry="6" fill="#F2F2F2" /><ellipse cx="22.5" cy="7" rx="2" ry="6" fill="#F2F2F2" /><ellipse cx="18" cy="7" rx="0.9" ry="4" fill="#FFC9D6" /><ellipse cx="22.5" cy="7" rx="0.9" ry="4" fill="#FFC9D6" /><circle cx="22" cy="17" r="1" fill="#3A2A1A" /><circle cx="6" cy="22" r="2.5" fill="#fff" /></svg>);
    case "bird":
      return (<svg width="24" height="22" viewBox="0 0 26 24" fill="none"><ellipse cx="13" cy="13" rx="8" ry="6.5" fill="#C98A5B" /><circle cx="18" cy="8" r="4" fill="#C98A5B" /><path d="M21 7 l4 1 -4 1z" fill="#FFB347" /><circle cx="19" cy="7.5" r="0.8" fill="#3A2A1A" /><path d="M3 13 q-3 1 -4 4" stroke="#C98A5B" strokeWidth="2.5" fill="none" strokeLinecap="round" /><rect x="11" y="18" width="1.6" height="4" fill="#FFB347" /><rect x="15" y="18" width="1.6" height="4" fill="#FFB347" /></svg>);
    case "sheep":
      return (<svg width="34" height="26" viewBox="0 0 38 30" fill="none"><circle cx="12" cy="16" r="7" fill="#F4F4F4" /><circle cx="19" cy="13" r="8" fill="#F4F4F4" /><circle cx="25" cy="16" r="7" fill="#F4F4F4" /><circle cx="18" cy="20" r="7" fill="#F4F4F4" /><circle cx="30" cy="15" r="4.5" fill="#4A4A4A" /><circle cx="31.5" cy="14.5" r="0.9" fill="#fff" /><rect x="14" y="24" width="2" height="5" fill="#4A4A4A" /><rect x="22" y="24" width="2" height="5" fill="#4A4A4A" /></svg>);
    default: // cat
      return (<svg width="34" height="24" viewBox="0 0 40 28" fill="none"><path d="M5 16 q-6 -3 -5 -11" stroke="#E8A85C" strokeWidth="3" fill="none" strokeLinecap="round" /><ellipse cx="17" cy="17" rx="12" ry="7" fill="#E8A85C" /><rect x="11" y="21" width="2.6" height="6" rx="1.3" fill="#D8954A" /><rect x="21" y="21" width="2.6" height="6" rx="1.3" fill="#D8954A" /><circle cx="29" cy="12" r="6" fill="#E8A85C" /><path d="M24 6.5 l1.4 4.2 -4 -0.6z" fill="#E8A85C" /><path d="M31 6.5 l2 3.6 -3.6 0.6z" fill="#E8A85C" /><circle cx="30.5" cy="12" r="1" fill="#3A2A1A" /><circle cx="33.6" cy="13" r="0.8" fill="#FF9E9E" /></svg>);
  }
}

const DAY_ANIMALS = ["cat", "dog", "rabbit", "bird"];
const NIGHT_ANIMALS = ["cat", "dog", "rabbit", "bird", "sheep", "cat", "rabbit", "dog", "bird", "sheep"];

export function TownMap({ business }: { business: Business }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const moversRef = useRef<HTMLDivElement[]>([]);
  const restRef = useRef(false);
  const [size, setSize] = useState({ w: 545, h: 800 });
  const [night, setNight] = useState<boolean | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [picoTap, setPicoTap] = useState(false);
  const [picoResting, setPicoResting] = useState(false);

  useEffect(() => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); }, []);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(1.4, Math.max(0.5, size.w / 560));
  const isNight = !!night;

  const visible = (p: { x: number; y: number }, h = TH) => {
    const sx = size.w / 2 + (p.x - DW / 2) * scale;
    const sy = size.h * TOPF + (p.y - DH / 2) * scale;
    const M = 60, MT = 260;
    return sx + (TW + 2) * scale > -M && sx < size.w + M && sy + (TH + 2) * scale > -MT && sy - (h - TH) * scale < size.h + M;
  };

  type Mover = { kind: "pico" | "person" | "car" | "animal"; src?: string; animal?: string; w: number; h: number; speed: number; cells: [number, number][] };
  const movers: Mover[] = [{ kind: "pico", w: 44, h: 44, speed: isNight ? 16 : 42, cells: PICO_CELLS }];
  const peopleCount = isNight ? 1 : 3;
  for (let i = 0; i < peopleCount; i++) movers.push({ kind: "person", src: `/town/person-${i + 1}.png`, w: 25 * S * 1.5, h: 40 * S * 1.5, speed: 32 + i * 6, cells: ROAD_CELLS });
  if (!isNight) movers.push({ kind: "car", src: "/town/car-red.png", w: 112 * S, h: 74 * S, speed: 58, cells: ROAD_CELLS });
  (isNight ? NIGHT_ANIMALS : DAY_ANIMALS).forEach((a, i) => movers.push({ kind: "animal", animal: a, w: 34, h: 30, speed: 16 + (i % 4) * 5, cells: GRASS_Q[i % 4].length ? GRASS_Q[i % 4] : GRASS_CELLS }));

  useEffect(() => {
    moversRef.current.length = movers.length;
    const nextTarget = (s: { x: number; y: number; kind: string; cells: [number, number][]; cell: [number, number] }) => {
      if (s.kind === "person" || s.kind === "car") {
        // stay on the road: only move to a cell on the same road arm (collinear), so the straight path follows the street
        const [cc, cr] = s.cell;
        const cands = ROAD_CELLS.filter(([c2, r2]) => (cr === MID && r2 === MID && c2 !== cc) || (cc === MID && c2 === MID && r2 !== cr));
        const nc = cands.length ? pick(cands) : pick(ROAD_CELLS);
        s.cell = nc; return cellCenter(...nc);
      }
      if (s.kind === "pico" && isNight) {
        const near = s.cells.filter((c) => { const ct = cellCenter(...c); const d = Math.hypot(ct.x - s.x, ct.y - s.y); return d > 6 && d < TW * 2; });
        const nc = near.length ? pick(near) : pick(s.cells);
        s.cell = nc; return cellCenter(...nc);
      }
      const nc = pick(s.cells); s.cell = nc; return cellCenter(...nc);
    };
    const states = movers.map((m) => {
      const sc = pick(m.cells); const s = cellCenter(...sc);
      return { x: s.x, y: s.y, tx: s.x, ty: s.y, cell: sc, pause: 0, face: 1, cells: m.cells, speed: m.speed, kind: m.kind };
    });
    let raf = 0; let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(60, t - last); last = t;
      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        if (t >= s.pause) {
          const dx = s.tx - s.x, dy = s.ty - s.y; const d = Math.hypot(dx, dy) || 1; const step = (s.speed * dt) / 1000;
          if (d <= step) { s.x = s.tx; s.y = s.ty; s.pause = t + (s.kind === "pico" && isNight ? 1800 + Math.random() * 3400 : 300 + Math.random() * 2200); const nt = nextTarget(s); s.face = nt.x < s.x ? -1 : 1; s.tx = nt.x; s.ty = nt.y; }
          else { s.x += (dx / d) * step; s.y += (dy / d) * step; s.face = dx < 0 ? -1 : 1; }
        }
        const el = moversRef.current[i];
        if (el) el.style.transform = s.kind === "pico" ? `translate(${s.x}px,${s.y}px)` : `translate(${s.x}px,${s.y}px) scaleX(${s.face})`;
      }
      const resting = t < states[0].pause;
      if (resting !== restRef.current) { restRef.current = resting; setPicoResting(resting); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNight]);

  const go = (href: string) => { if (tapped) return; setTapped(href); window.setTimeout(() => router.push(href), 360); };
  const tapPico = () => { if (picoTap) return; setPicoTap(true); window.setTimeout(() => router.push("/pico"), 720); };

  const buildings: Civic[] = business ? [...CIVIC, { col: SHOP_CELL[0], row: SHOP_CELL[1], key: "shop", label: "かいしゃ", href: "/business" }] : CIVIC;
  const picoMood: PicoMood = picoTap ? "happy" : isNight ? (picoResting ? "sleep" : "tired") : "happy";

  const tiles = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const p = tilePos(c, r);
    if (!visible(p)) continue;
    tiles.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img key={`g${c}-${r}`} src={isRoad(c, r) ? "/town/road.png" : "/town/ground.png"} alt="" aria-hidden draggable={false} className="pointer-events-none absolute select-none" style={{ left: p.x, top: p.y, width: TW + 1, height: TH + 1, zIndex: depth(c, r) }} />
    );
  }

  const cloudColor = isNight ? "rgba(196,206,224,0.30)" : "rgba(255,255,255,0.55)";
  const label = (text: string) => (
    <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[15px] font-extrabold text-[#4a3a28] shadow">{text}</span>
  );

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden" style={{ background: isNight ? "linear-gradient(180deg,#33372A 0%,#3B4030 45%,#33372A 100%)" : "linear-gradient(180deg,#CBCF98 0%,#BCC488 45%,#AEB778 100%)", transition: "background 1.2s ease" }}>
      <div className="absolute left-1/2" style={{ top: `${TOPF * 100}%`, width: DW, height: DH, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center", zIndex: 20, filter: isNight ? "brightness(0.66) saturate(0.92)" : "saturate(0.98) brightness(1.02)", transition: "filter 1.2s ease" }}>
        {tiles}

        {FILLER.map(({ c, r, sp: key }, k) => {
          const p = tilePos(c, r); const sp = SP[key]; const w = sp.w * S; const h = sp.h * S;
          if (!visible(p, h)) return null;
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
              {isNight && <span className="pointer-events-none absolute rounded-full" style={{ left: "50%", top: "55%", width: w * 0.5, height: h * 0.4, transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(255,220,140,0.75),transparent 70%)" }} />}
              {active && ["-10,-6", "10,-4", "0,-12", "-6,4"].map((s, j) => { const [x, y] = s.split(","); return <span key={j} className="town-spark pointer-events-none absolute left-1/2 top-1/3 text-[12px]" style={{ animationDelay: `${j * 40}ms`, "--tx": `${x}px`, "--ty": `${y}px` } as React.CSSProperties}>✦</span>; })}
            </button>
          );
        })}

        {!business && (() => {
          const p = tilePos(SHOP_CELL[0], SHOP_CELL[1]); const active = tapped === "/explore";
          return (
            <button type="button" onClick={() => go("/explore")} aria-label="あきち" className={`town-pop absolute flex flex-col items-center ${active ? "town-bounce" : ""}`} style={{ left: p.x + TW * 0.18, top: p.y + TH * 0.06, width: TW * 0.64, zIndex: depth(SHOP_CELL[0], SHOP_CELL[1]) + 3, transformOrigin: "bottom center" }}>
              {label("あきち")}
              <span className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-[#8a7a5a]/70 bg-white/20" style={{ height: TH * 0.7 }}><span className="material-symbols-outlined text-[26px] text-[#6a5a3a]">add</span></span>
            </button>
          );
        })()}

        {movers.map((m, i) => (
          <div key={`m${i}`} ref={(el) => { if (el) moversRef.current[i] = el; }} className="absolute left-0 top-0" style={{ zIndex: m.kind === "animal" ? 8000 + i : 9000 + i, willChange: "transform" }}>
            {m.kind === "pico" ? (
              <div className={`-translate-x-1/2 -translate-y-[70%] ${picoTap ? "town-hop" : ""}`}>
                <button type="button" onClick={tapPico} aria-label="ピコとはなす" className="flex flex-col items-center active:scale-90" style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}>
                  {picoTap && <span className="town-bubble absolute -top-7 whitespace-nowrap rounded-2xl bg-white px-2 py-1 text-[12px] font-bold text-[#5a4a38] shadow">やあ！👋</span>}
                  <span className="mb-0.5 inline-block rounded-full bg-[#3A2A1A]/85 px-2 py-0.5 text-[11px] font-extrabold leading-none text-white shadow-sm">ピコ</span>
                  <PicoAvatar size={44} mood={picoMood} />
                </button>
              </div>
            ) : m.kind === "animal" ? (
              <div className="town-bob -translate-x-1/2 -translate-y-full" style={{ filter: "drop-shadow(0 2px 2px rgba(60,42,26,0.22))" }}><Critter type={m.animal!} /></div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.src} alt="" aria-hidden draggable={false} className="town-bob -translate-x-1/2 -translate-y-full select-none" style={{ width: m.w, height: m.h, filter: "drop-shadow(0 2px 2px rgba(60,42,26,0.2))" }} />
            )}
          </div>
        ))}
      </div>

      {/* slow drifting clouds (hazy at night) */}
      {[{ a: "town-drift1", top: "12%", w: 150, dur: 58, delay: 0 }, { a: "town-drift2", top: "30%", w: 110, dur: 74, delay: 26 }, { a: "town-drift1", top: "6%", w: 130, dur: 92, delay: 50 }].map((cl, k) => (
        <div key={k} className={`${cl.a} pointer-events-none absolute`} style={{ top: cl.top, left: 0, zIndex: 45, animationDuration: `${cl.dur}s`, animationDelay: `${cl.delay}s`, filter: "blur(7px)" }} aria-hidden>
          <div className="relative" style={{ width: cl.w, height: cl.w * 0.42 }}>
            <span className="absolute rounded-full" style={{ left: 0, top: "30%", width: cl.w * 0.55, height: cl.w * 0.3, background: cloudColor }} />
            <span className="absolute rounded-full" style={{ left: cl.w * 0.28, top: 0, width: cl.w * 0.5, height: cl.w * 0.42, background: cloudColor }} />
            <span className="absolute rounded-full" style={{ left: cl.w * 0.5, top: "26%", width: cl.w * 0.5, height: cl.w * 0.3, background: cloudColor }} />
          </div>
        </div>
      ))}

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
        @keyframes town-drift1 { 0%{transform:translateX(-44vw)} 42%{transform:translateX(120vw)} 100%{transform:translateX(120vw)} }
        @keyframes town-drift2 { 0%{transform:translateX(120vw)} 46%{transform:translateX(-44vw)} 100%{transform:translateX(-44vw)} }
        .town-bob{animation:town-bob .5s ease-in-out infinite}
        .town-pop{animation:town-pop .5s ease both}
        .town-bounce{animation:town-bounce .36s ease}
        .town-spark{animation:town-spark .5s ease-out forwards}
        .town-hop{animation:town-hop .7s ease}
        .town-bubble{animation:town-bubble .2s ease both}
        .town-sway{animation:town-sway 4.5s ease-in-out infinite}
        .town-drift1{animation:town-drift1 linear infinite}
        .town-drift2{animation:town-drift2 linear infinite}
        @media (prefers-reduced-motion: reduce){ .town-bob,.town-sway,.town-drift1,.town-drift2{animation:none} .town-pop{animation:none;opacity:1} }
      `}</style>
    </div>
  );
}
