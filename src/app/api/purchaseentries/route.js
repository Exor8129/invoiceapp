// app/api/purchase-entries/route.js
import { Prisma, PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// ───────────────────────────────────────────── GET
export async function GET() {
  try {
    const entries = await prisma.purchaseEntry.findMany({
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(entries);
  } catch (err) {
    console.error('[GET /purchase-entries]', err);
    return NextResponse.json(
      { message: 'Failed to fetch purchase entries' },
      { status: 500 },
    );
  }
}

// ───────────────────────────────────────────── POST
export async function POST(req) {
  try {
    const payload = await req.json();

    if (!payload?.items?.length) {
      return NextResponse.json(
        { message: 'No items to save' },
        { status: 400 },
      );
    }

    const rows = payload.items.map((item) => ({
      date: new Date(payload.invoiceDate),
      partyName: payload.partyName,
      purchaseNumber: payload.purchaseNumber,
      itemName: item.name,
      quantity: Number(item.qty),                           // Int
      purchaseRate: new Prisma.Decimal(item.rate),          // Decimal
      purchaseReferenceNumber: payload.poNumber ?? null,
    }));

    await prisma.purchaseEntry.createMany({
      data: rows,
      skipDuplicates: true,          // optional but handy
    });

    return NextResponse.json({ message: 'Saved' }, { status: 201 });
  } catch (err) {
    console.error('POST /purchase-entries →', err);
    return NextResponse.json(
      { message: err.message || 'Server error' },
      { status: 500 },
    );
  }
}
