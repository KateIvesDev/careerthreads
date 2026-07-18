import { CareerRecordHome } from "@/components/record/CareerRecordHome";
import { getCareerRecord } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const record = await getCareerRecord();
  return <CareerRecordHome record={record} />;
}
