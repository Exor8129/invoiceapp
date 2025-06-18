import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

/* GET  /api/purchase-entries/next
   --------------------------------------------------------------
   Returns the next sequential purchase number for the
   current financial year (APR → MAR).
   Example response:  { nextNumber: "PUR/17/25‑26" }
*/
export async function GET() {
  try {
    // Determine current financial year
    const today = dayjs();
    const fyStart = today.month() >= 3
      ? dayjs(`${today.year()}-04-01`)
      : dayjs(`${today.year() - 1}-04-01`);
    const fyEnd = fyStart.add(1, 'year');

    // Fetch the latest purchase number in the current FY
    const latest = await prisma.purchaseEntry.findFirst({
      where: {
        date: {
          gte: fyStart.toDate(),
          lt: fyEnd.toDate(),
        },
      },
      orderBy: [{ id: 'desc' }],
      select: { purchaseNumber: true },
    });

    // Extract sequence number from format: "PUR/17/25‑26"
    const lastSeq = latest?.purchaseNumber
      ? parseInt(latest.purchaseNumber.split('/')[1], 10) // [ 'PUR', '17', '25‑26' ]
      : 0;

    const nextSeq = lastSeq + 1;

    // Format FY suffix: "25‑26"
    const fySuffix = `${fyStart.year().toString().slice(-2)}‑${fyEnd.year().toString().slice(-2)}`;

    // Final format: "PUR/17/25‑26"
    const nextNumber = `PUR/${nextSeq}/${fySuffix}`;

    return NextResponse.json({ nextNumber });
  } catch (err) {
    console.error('[GET /purchase-entries/next]', err);
    return NextResponse.json({ message: 'Failed to get next number' }, { status: 500 });
  }
}
  