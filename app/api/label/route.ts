import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const rlhfLabels = db.collection("rlhf-labels");

    const body = await request.json();
    const { id, input, output, medical_accuracy, helpfulness, clarity } = body;

    // Validate inputs
    if (
      !id ||
      !input ||
      !output ||
      !medical_accuracy ||
      !helpfulness ||
      !clarity ||
      medical_accuracy < 1 ||
      medical_accuracy > 5 ||
      helpfulness < 1 ||
      helpfulness > 5 ||
      clarity < 1 ||
      clarity > 5
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Insert the label into the database
    await rlhfLabels.insertOne({
      id,
      input,
      output,
      medical_accuracy,
      helpfulness,
      clarity,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving label:", error);
    return NextResponse.json(
      { error: "Failed to save label" },
      { status: 500 }
    );
  }
}
