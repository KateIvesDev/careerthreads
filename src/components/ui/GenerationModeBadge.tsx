import { modeLabel, type GenerationMode } from "@/lib/ai/demo-mode";
export function GenerationModeBadge({ mode }: { mode: GenerationMode }) { return <span className={`source-badge generation-${mode}`}>{modeLabel(mode)}</span>; }
