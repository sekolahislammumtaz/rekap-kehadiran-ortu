import { NextResponse } from "next/server";
import { generateSampleExcelBuffer } from "@/lib/sample-excel";

export async function GET() {
  try {
    const buffer = generateSampleExcelBuffer();
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Template_Kehadiran_Kajian_Mumtaz.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal membuat template" }, { status: 500 });
  }
}
