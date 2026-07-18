import { getCareerRecord } from "@/lib/db/queries";

export async function GET() {
  try {
    return Response.json({ data: await getCareerRecord() });
  } catch {
    return Response.json(
      {
        error: {
          code: "DATA_UNAVAILABLE",
          message: "The Career Record is temporarily unavailable.",
          retryable: true,
        },
      },
      { status: 500 },
    );
  }
}
