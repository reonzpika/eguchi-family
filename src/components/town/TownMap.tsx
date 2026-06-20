"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PicoAvatar } from "@/components/journey/Pico";

type Business = { id: string; idea: string; current_stage: string; status: string } | null;

/* ---- isometric grid maths (design space) ---- */
const SRC_TW = 257;
const TW = 150; // big cosy tiles
const TH = (TW * 129) / 257;
const S = TW / SRC_TW;
const N = 4; // small cosy grid
const ORIGIN_X = (N - 1) * (TW / 2);
const ORIGIN_Y = 184;
const DW = (N - 1 + N - 1) * (TW / 2) + TW;
const DH = ORIGIN_Y + (N - 1 + N - 1) * (TH / 2) + TH + 44;

const tilePos = (c: number, r: number) => ({ x: ORIGIN_X + (c - r) * (TW / 2), y: ORIGIN_Y + (c + r) * (TH / 2) });
const cellCenter = (c: number, r: number) => { const p = tilePos(c, r); return { x: p.x + TW / 2, y: p.y + TH / 2 }; };
const depth = (c: number, r: number) => (c + r) * 2;
const isRoad = (c: number, r: number) => r === 2 || c === 1;

/* ---- sprites ---- */
const SP = {
  cottage: { src: "/town/cottage.png", w: 225, h: 193 },
  market: { src: "/town/market.png", w: 261, h: 203 },
  library: { src: "/town/library.png", w: 425, h: 345 },
  shop: { src: "/town/shop.png", w: 225, h: 193 },
  houseB: { src: "/town/house-b.png", w: 253, h: 174 },
  tree1: { src: "/town/tree-01.png", w: 139, h: 210 },
  tree3: { src: "/town/tree-03.png", w: 142, h: 209 },
  fpink: { src: "/town/flowers-pink.png", w: 24, h: 13 },
  fyellow: { src: "/town/flowers-yellow.png", w: 24, h: 13 },
} as const;

// decorative (non-interactive): [col,row,key,scaleMul?]
const DECOR: [number, number, keyof typeof SP, number?][] = [
  [2, 0, "houseB"], [3, 1, "tree1"], [0, 1, "tree3"], [2, 3, "fpink"], [2, 1, "fyellow"],
];

// walkable cells (roads + open ground) and road-only cells (for cars)
const ROAD_CELLS: [number, number][] = [[0, 2], [1, 2], [2, 2], [3, 2], [1, 0], [1, 1], [1, 3]];
const WALK_CELLS: [number, number][] = [...ROAD_CELLS, [2, 1], [2, 3]];

type Civic = { col: number; row: number; key: keyof typeof SP; label: string; href: string; scaleMul?: number };
const CIVIC: Civic[] = [
  { col: 0, row: 0, key: "cottage", label: "ピコのいえ", href: "/pico" },
  { col: 3, row: 0, key: "market", label: "アイデアいちば", href: "/explore" },
  { col: 0, row: 3, key: "library", label: "がくしゅうかん", href: "/learn", scaleMul: 0.74 },
];

/* ---- random helpers (runtime only) ---- */
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export function TownMap({ business }: { business: Business }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const moversRef = useRef<HTMLDivElement[]>([]);
  const [scale, setScale] = useState(0.6);
  const [night, setNight] = useState<boolean | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);
  const [picoTap, setPicoTap] = useState(false);

  useEffect(() => { const h = new Date().getHours(); setNight(h >= 19 || h < 6); }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => setScale(Math.min(el.clientWidth / DW, (el.clientHeight * 0.66) / DH, 1.6));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isNight = !!night;
  const peopleCount = isNight ? 1 : 3;
  const carCount = isNight ? 0 : 1;

  // movers: index 0 = ピコ, then people, then cars
  const movers: { kind: "pico" | "person" | "car"; src?: string; w: number; h: number; speed: number; cells: [number, number][] }[] = [
    { kind: "pico", w: 44, h: 44, speed: isNight ? 26 : 40, cells: WALK_CELLS },
  ];
  for (let i = 0; i < peopleCount; i++) movers.push({ kind: "person", src: `/town/person-${i + 1}.png`, w: 25 * S * 1.6, h: 40 * S * 1.6, speed: 34 + i * 6, cells: WALK_CELLS });
  for (let i = 0; i < carCount; i++) movers.push({ kind: "car", src: "/town/car-1.png", w: 112 * S, h: 74 * S, speed: 70, cells: ROAD_CELLS });

  // random-wander engine (transforms via refs, no per-frame React render)
  useEffect(() => {
    moversRef.current.length = movers.length;
    const states = movers.map((m) => {
      const start = cellCenter(...pick(m.cells));
      const tgt = cellCenter(...pick(m.cells));
      return { x: start.x, y: start.y, tx: tgt.x, ty: tgt.y, pause: 0, face: 1, cells: m.cells, speed: m.speed, kind: m.kind };
    });
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(60, t - last);
      last = t;
      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        if (t >= s.pause) {
          const dx = s.tx - s.x, dy = s.ty - s.y;
          const d = Math.hypot(dx, dy) || 1;
          const step = (s.speed * dt) / 1000;
          if (d <= step) {
            s.x = s.tx; s.y = s.ty;
            s.pause = t + 500 + Math.random() * 1800;
            const nt = cellCenter(...pick(s.cells));
            s.face = nt.x < s.x ? -1 : 1;
            s.tx = nt.x; s.ty = nt.y;
          } else {
            s.x += (dx / d) * step; s.y += (dy / d) * step;
            s.face = dx < 0 ? -1 : 1;
          }
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

  const go = (href: string) => {
    if (tapped) return;
    setTapped(href);
    window.setTimeout(() => router.push(href), 360);
  };
  const tapPico = () => {
    if (picoTap) return;
    setPicoTap(true);
    window.setTimeout(() => router.push("/pico"), 720);
  };

  const buildings: Civic[] = business
    ? [...CIVIC, { col: 3, row: 3, key: "shop", label: "わたしのおみせ", href: "/business" }]
    : CIVIC;

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
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden" style={{ background: isNight ? "linear-gradient(180deg,#26314F 0%,#3E4A78 26%,#6E7FA8 46%,#88A97A 64%,#7FA06A 100%)" : "linear-gradient(180deg,#FFE9D6 0%,#FFD9B8 18%,#FBC9D8 33%,#CDE9B8 56%,#B7DEA0 100%)", transition: "background 1.2s ease" }}>
      {/* hills behind the town */}
      <div className="pointer-events-none absolute inset-x-0" style={{ top: "34%", zIndex: 1 }} aria-hidden>
        <div className="absolute left-[-10%] h-40 w-[55%] rounded-[100%]" style={{ top: 20, background: isNight ? "#5D6F58" : "#A9D690" }} />
        <div className="absolute right-[-12%] h-44 w-[60%] rounded-[100%]" style={{ top: 6, background: isNight ? "#54664F" : "#9ACE82" }} />
        <div className="absolute left-[20%] h-40 w-[70%] rounded-[100%]" style={{ top: 40, background: isNight ? "#4E6049" : "#8FC877" }} />
      </div>

      {/* sun / moon */}
      <div className="town-celestial pointer-events-none absolute right-8 top-6 h-14 w-14 rounded-full" style={{ background: isNight ? "radial-gradient(circle,#FFFDF0 0%,#F4E8B0 58%,transparent 70%)" : "radial-gradient(circle,#FFF1C4 0%,#FFD98C 55%,transparent 72%)", zIndex: 2 }} aria-hidden />

      {/* sky life */}
      {isNight ? (
        ["14,12,0s", "34,8,.6s", "58,14,1.1s", "80,10,.3s", "24,18,.9s", "68,6,1.4s"].map((s, k) => { const [l, t, d] = s.split(","); return <span key={k} className="town-twinkle pointer-events-none absolute text-[10px]" style={{ left: `${l}%`, top: `${t}%`, zIndex: 2, animationDelay: d }} aria-hidden>✦</span>; })
      ) : (
        <>
          <div className="town-cloud town-cloud-1 pointer-events-none absolute h-7 w-20 rounded-full bg-white/80" style={{ top: "10%", zIndex: 2 }} aria-hidden />
          <div className="town-cloud town-cloud-2 pointer-events-none absolute h-5 w-14 rounded-full bg-white/70" style={{ top: "18%", zIndex: 2 }} aria-hidden />
          {/* hot-air balloon */}
          <div className="town-balloon pointer-events-none absolute" style={{ top: "8%", zIndex: 3 }} aria-hidden>
            <svg width="34" height="48" viewBox="0 0 34 48"><path d="M17 1C8 1 2 8 2 16c0 7 6 12 9 16h12c3-4 9-9 9-16C32 8 26 1 17 1z" fill="#FF9ECF" /><path d="M17 1c-4 0-6 7-6 16s2 16 6 16 6-7 6-16S21 1 17 1z" fill="#FFC36E" opacity="0.7" /><rect x="13" y="38" width="8" height="6" rx="1" fill="#9B6B43" /><path d="M11 32l2 6M23 32l-2 6" stroke="#7A5A3A" strokeWidth="1" /></svg>
          </div>
          <div className="town-bird pointer-events-none absolute" style={{ zIndex: 3 }} aria-hidden><div className="town-bird-flap"><svg width="22" height="14" viewBox="0 0 26 16"><path d="M2 10 Q7 3 13 9 Q19 3 24 10" stroke="#6f6f80" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg></div></div>
          <div className="town-bird town-bird-2 pointer-events-none absolute" style={{ zIndex: 3 }} aria-hidden><div className="town-bird-flap"><svg width="18" height="11" viewBox="0 0 26 16"><path d="M2 10 Q7 3 13 9 Q19 3 24 10" stroke="#7a7a8a" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg></div></div>
        </>
      )}

      {/* foreground path leading off-screen */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: "70%", height: "26%", zIndex: 30, clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)", background: isNight ? "linear-gradient(#5b5750,#6b6760)" : "linear-gradient(#cdbfa6,#d9cdb4)", opacity: 0.92 }} aria-hidden />

      {/* glowing street lamps at night */}
      {isNight && ["26,60", "74,64"].map((s, k) => { const [l, t] = s.split(","); return (
        <div key={k} className="pointer-events-none absolute" style={{ left: `${l}%`, top: `${t}%`, zIndex: 33 }} aria-hidden>
          <div className="town-celestial absolute left-1/2 -translate-x-1/2 -top-2 h-7 w-7 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,224,140,0.85),transparent 70%)" }} />
          <div className="absolute left-1/2 -translate-x-1/2 h-7 w-[2px]" style={{ background: "#3A2A1A", opacity: 0.55 }} />
        </div>
      ); })}

      {/* fireflies at night */}
      {isNight && ["20,80", "32,88", "70,84", "82,78", "50,92", "60,72"].map((s, k) => { const [l, t] = s.split(","); return <span key={k} className="town-firefly pointer-events-none absolute h-1.5 w-1.5 rounded-full" style={{ left: `${l}%`, top: `${t}%`, background: "#FFF3A6", boxShadow: "0 0 6px 2px rgba(255,240,150,0.8)", zIndex: 35, animationDelay: `${k * 0.4}s` }} aria-hidden />; })}

      {/* title + day/night toggle */}
      <p className="pointer-events-none absolute left-1/2 top-3 z-[40] -translate-x-1/2 rounded-full bg-white/75 px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#6a5638]">エグチタウン {isNight ? "🌙" : "☀️"}</p>
      <button type="button" onClick={() => setNight((n) => !n)} className="absolute left-3 top-3 z-[40] flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6a5638] shadow-sm active:scale-90" aria-label={isNight ? "昼にする" : "夜にする"}>
        <span className="material-symbols-outlined text-[18px]">{isNight ? "light_mode" : "dark_mode"}</span>
      </button>

      {/* pastel wash */}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 38, background: "radial-gradient(120% 80% at 50% 30%, rgba(255,228,214,0.18), rgba(255,210,230,0.10) 60%, transparent)", mixBlendMode: "soft-light" }} aria-hidden />

      {/* scaled isometric town */}
      <div className="absolute left-1/2 top-1/2" style={{ width: DW, height: DH, transform: `translate(-50%,-50%) scale(${scale})`, transformOrigin: "center", zIndex: 20, filter: "saturate(0.96) brightness(1.03)" }}>
        {tiles}

        {DECOR.map(([c, r, key, m], k) => {
          const sp = SP[key]; const w = sp.w * S * (m ?? 1); const h = sp.h * S * (m ?? 1); const p = tilePos(c, r);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`d${k}`} src={sp.src} alt="" aria-hidden draggable={false} className={`pointer-events-none absolute select-none${sp.h > 150 ? " town-sway" : ""}`} style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, height: h, zIndex: depth(c, r) + 1, transformOrigin: "bottom center", filter: "drop-shadow(0 5px 6px rgba(60,42,26,0.16))" }} />
          );
        })}

        {/* civic + business buildings (interactive, tap feedback) */}
        {buildings.map((b, k) => {
          const sp = SP[b.key]; const w = sp.w * S * (b.scaleMul ?? 1); const h = sp.h * S * (b.scaleMul ?? 1); const p = tilePos(b.col, b.row);
          const active = tapped === b.href;
          return (
            <button key={`c${k}`} type="button" onClick={() => go(b.href)} aria-label={b.label} className={`town-pop group absolute ${active ? "town-bounce" : ""}`} style={{ left: p.x + (TW - w) / 2, top: p.y + TH - h, width: w, zIndex: depth(b.col, b.row) + 2, animationDelay: `${k * 80}ms`, transformOrigin: "bottom center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sp.src} alt="" draggable={false} className="select-none transition-transform duration-200 group-hover:-translate-y-1" style={{ width: w, height: h, filter: "drop-shadow(0 7px 7px rgba(60,42,26,0.2))" }} />
              {isNight && <span className="pointer-events-none absolute rounded-full" style={{ left: "50%", top: "55%", width: w * 0.5, height: h * 0.4, transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(255,220,140,0.55),transparent 70%)" }} />}
              {active && ["-10,-6", "10,-4", "0,-12", "-6,4"].map((s, j) => { const [x, y] = s.split(","); return <span key={j} className="town-spark pointer-events-none absolute left-1/2 top-1/3 text-[12px]" style={{ animationDelay: `${j * 40}ms`, "--tx": `${x}px`, "--ty": `${y}px` } as React.CSSProperties}>✦</span>; })}
              <span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm">{b.label}</span>
            </button>
          );
        })}

        {!business && (() => {
          const p = tilePos(3, 3); const active = tapped === "/explore";
          return (
            <button type="button" onClick={() => go("/explore")} aria-label="あきち" className={`town-pop absolute flex flex-col items-center ${active ? "town-bounce" : ""}`} style={{ left: p.x + TW * 0.18, top: p.y + TH * 0.06, width: TW * 0.64, zIndex: depth(3, 3) + 2, transformOrigin: "bottom center" }}>
              <span className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-[#8a7a5a]/70 bg-white/20" style={{ height: TH * 0.7 }}><span className="material-symbols-outlined text-[26px] text-[#6a5a3a]">add</span></span>
              <span className="mt-0.5 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-[#5a4a38] shadow-sm">あきち</span>
            </button>
          );
        })()}

        {/* movers: ピコ + townsfolk + car (positions driven by the wander engine) */}
        {movers.map((m, i) => (
          <div key={`m${i}`} ref={(el) => { if (el) moversRef.current[i] = el; }} className="absolute left-0 top-0" style={{ zIndex: m.kind === "pico" ? 1000 : 500, willChange: "transform" }}>
            {m.kind === "pico" ? (
              <div className={`-translate-x-1/2 -translate-y-[70%] ${picoTap ? "town-hop" : ""}`}>
                <button type="button" onClick={tapPico} aria-label="ピコとはなす" className="flex flex-col items-center active:scale-90" style={{ filter: "drop-shadow(0 5px 4px rgba(60,42,26,0.22))" }}>
                  {picoTap && <span className="town-bubble absolute -top-7 whitespace-nowrap rounded-2xl bg-white px-2 py-1 text-[11px] font-bold text-[#5a4a38] shadow">やあ！👋</span>}
                  <span className="mb-0.5 inline-block rounded-full bg-[#3A2A1A]/85 px-2 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm">ピコ</span>
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

      <style>{`
        @keyframes town-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes town-pop { 0%{opacity:0;transform:translateY(8px) scale(.92)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes town-bounce { 0%,100%{transform:translateY(0) scale(1)} 35%{transform:translateY(-10px) scale(1.06)} 70%{transform:translateY(0) scale(.98)} }
        @keyframes town-spark { 0%{opacity:1;transform:translate(0,0) scale(.4);color:#FFD36E} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(1.2);color:#FF9ECF} }
        @keyframes town-hop { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-12px)} 60%{transform:translateY(0)} }
        @keyframes town-bubble { 0%{opacity:0;transform:translateY(4px) scale(.8)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes town-sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes town-cloud-1 { 0%{left:-22%} 100%{left:118%} }
        @keyframes town-cloud-2 { 0%{left:-18%} 100%{left:116%} }
        @keyframes town-balloon { 0%{left:-12%;top:8%} 50%{top:4%} 100%{left:115%;top:9%} }
        @keyframes town-bird { 0%{left:-12%;top:16%} 50%{top:9%} 100%{left:116%;top:15%} }
        @keyframes town-bird-2 { 0%{left:116%;top:22%} 50%{top:13%} 100%{left:-12%;top:24%} }
        @keyframes town-bird-flap { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(.5)} }
        @keyframes town-twinkle { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes town-firefly { 0%,100%{opacity:.2;transform:translate(0,0)} 50%{opacity:1;transform:translate(6px,-8px)} }
        @keyframes town-celestial { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }

        .town-bob{animation:town-bob .5s ease-in-out infinite}
        .town-pop{animation:town-pop .5s ease both}
        .town-bounce{animation:town-bounce .36s ease}
        .town-spark{animation:town-spark .5s ease-out forwards}
        .town-hop{animation:town-hop .7s ease}
        .town-bubble{animation:town-bubble .2s ease both}
        .town-sway{animation:town-sway 4.5s ease-in-out infinite}
        .town-cloud-1{animation:town-cloud-1 52s linear infinite}
        .town-cloud-2{animation:town-cloud-2 68s linear infinite}
        .town-balloon{animation:town-balloon 60s linear infinite}
        .town-bird{animation:town-bird 17s linear infinite}
        .town-bird-2{animation:town-bird-2 23s linear infinite}
        .town-bird-flap{animation:town-bird-flap .4s ease-in-out infinite}
        .town-twinkle{animation:town-twinkle 2.4s ease-in-out infinite;color:#FFF6D8}
        .town-firefly{animation:town-firefly 3s ease-in-out infinite}
        .town-celestial{animation:town-celestial 6s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce){
          .town-bob,.town-sway,.town-cloud-1,.town-cloud-2,.town-balloon,.town-bird,.town-bird-2,.town-bird-flap,.town-twinkle,.town-firefly,.town-celestial{animation:none}
          .town-pop{animation:none;opacity:1}
        }
      `}</style>
    </div>
  );
}
