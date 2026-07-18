import Link from "next/link";
import { PromotionBuilder } from "@/components/assets/PromotionBuilder";
import { getCareerAsset, getPromotionSourceOptions } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export default async function PromotionPage({ searchParams }: { searchParams: Promise<{ asset?: string }> }) { const { asset: assetId } = await searchParams; const [options, asset] = await Promise.all([getPromotionSourceOptions(), assetId ? getCareerAsset(assetId) : null]); return <main className="flow-shell asset-shell"><Link className="back-link" href="/">← Career Record</Link><header><p className="eyebrow">Promotion packet</p><h1>Turn approved memory into a source-linked case.</h1><p>Select only the experiences you want to use. Every generated claim remains editable and linked to its approved source.</p></header><PromotionBuilder options={options} initialAsset={asset ? { id: asset.id, draft: asset.content_json, mode: asset.generation_mode } : null}/></main>; }
