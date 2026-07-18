export type DemoSafeMode = "off" | "fallback" | "fixture";
export type GenerationMode = "live" | "heuristic" | "template" | "fixture";

export function shouldCallLiveModel(mode: DemoSafeMode) { return mode !== "fixture"; }
export function mayUseFallback(mode: DemoSafeMode) { return mode === "fallback"; }
export function modeLabel(mode: GenerationMode) {
  return { live: "Live AI", heuristic: "Heuristic fallback", template: "Deterministic template", fixture: "Demo fixture response" }[mode];
}
