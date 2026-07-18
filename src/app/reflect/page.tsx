import Link from "next/link";
import { ReflectionComposer } from "@/components/reflection/ReflectionComposer";

export default function ReflectPage() {
  return <main className="flow-shell"><Link className="back-link" href="/">← Career Record</Link><header><p className="eyebrow">Reflection</p><h1>Turn a moment into professional memory.</h1><p>Describe the work in your own words. Nothing becomes part of your Career Record until you review it.</p></header><ReflectionComposer /></main>;
}
