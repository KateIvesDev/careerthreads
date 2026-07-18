import Link from "next/link";
import { EvolutionChart } from "@/components/evolution/EvolutionChart";
import { getCareerEvolution } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function EvolutionPage() {
  const evolution = await getCareerEvolution();
  return <main className="flow-shell evolution-shell"><Link className="back-link" href="/">← Career Record</Link><header><p className="eyebrow">Career Evolution</p><h1>See the threads your record supports over time.</h1><p>This measures approved Career Record evidence—not performance. Bands use the current and previous quarter; select a point to inspect its records.</p><nav className="theme-filters" aria-label="Theme filters">{evolution.themes.map((theme) => <Link href={`#${theme.slug}`} key={theme.id}>{theme.name}</Link>)}</nav></header><EvolutionChart evolution={evolution}/></main>;
}
