import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();

    // Basic input validation
    if (!body.stockitemId || !body.batchNo || !body.quantity)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const batch = await prisma.productBatch.create({
      data: {
        stockitemId: body.stockitemId,
        batchNo:     body.batchNo,
        serialNo:    body.serialNo || null,
        expiryDate:  body.expiryDate ? new Date(body.expiryDate) : null,
        mfgDate:     body.mfgDate ? new Date(body.mfgDate) : null,
        quantity:    body.quantity,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
