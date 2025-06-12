import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();

    const { originalUid, originalName, newUid, newName } = body;

    if (!originalUid || !originalName || !newUid || !newName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.saleData2425.updateMany({
      where: {
        uid: originalUid,
        item_name: originalName,
      },
      data: {
        uid: newUid,
        item_name: newName,
      },
    });

    console.log("🔄 Update result:", updated);

    if (updated.count === 0) {
      return NextResponse.json({ error: "No matching records found to update" }, { status: 404 });
    }

    return NextResponse.json({ message: "Items updated successfully", updated });
  } catch (error) {
    console.error("🔴 Error during updateMany:", error);
    return NextResponse.json({ error: "Failed to update item in database" }, { status: 500 });
  }
}