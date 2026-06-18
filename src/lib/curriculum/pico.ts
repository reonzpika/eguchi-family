/** ピコ (Piko): the curious, excited little AI buddy who guides the journey. */

export const PICO_NAME = "ピコ";

export const PICO_CELEBRATIONS = [
  "やったね！また一歩すすんだよ 🎉",
  "すごいすごい！その調子だね！",
  "できたね！ぼく、うれしいな。",
  "ナイス！どんどん上手になってる！",
  "おみごと！次も楽しみだね。",
];

export const PICO_CLIFFHANGER = "次はね…ナイショ。でも、きっと「えっ！」ってなるよ。";

/** Deterministic pick (no Math.random, keeps SSR stable). */
export function picoCelebration(seed: number): string {
  const i = Math.abs(seed) % PICO_CELEBRATIONS.length;
  return PICO_CELEBRATIONS[i];
}
