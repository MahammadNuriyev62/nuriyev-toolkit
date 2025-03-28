import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  const db = await connectToDatabase();
  const rlhfLabels = db.collection("rlhf-labels");
}
