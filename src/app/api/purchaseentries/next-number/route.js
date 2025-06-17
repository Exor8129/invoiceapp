import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

/* GET  /api/purchase-entries/next
   --------------------------------------------------------------
   Returns the next sequential purchase number for the
   current financial year (APR → MAR).
   Example response:  { nextNumber: "17/25‑26" }
*/
export async function GET() {
  try {
    // work out current FY
    const today = dayjs();
    const fyStart = today.month() >= 3           // April = 3 (0‑based)
      ? dayjs(`${today.year()}-04-01`)
      : dayjs(`${today.year() - 1}-04-01`);

    const fyEnd = fyStart.add(1, 'year');        // 1 April next year

    // latest purchaseNumber in this FY
    const latest = await prisma.PurchaseEntry.findFirst({
      where: {
        date: {
          gte: fyStart.toDate(),
          lt:  fyEnd.toDate(),
        },
      },
      orderBy: [{ id: 'desc' }],
      select: { purchaseNumber: true },
    });

    // extract running number before the slash
    const lastSeq = latest
      ? parseInt(latest.purchaseNumber.split('/')[0], 10)
      : 0;

    const nextSeq = lastSeq + 1; // 17 → if last was 16/25‑26

    // build FY suffix like "25‑26"
    const fySuffix = `${fyStart.year().toString().slice(-2)}‑${fyEnd.year().toString().slice(-2)}`;

    const nextNumber = `${nextSeq}/${fySuffix}`;

    return NextResponse.json({ nextNumber });
  } catch (err) {
    console.error('[GET /purchase-entries/next]', err);
    return NextResponse.json({ message: 'Failed to get next number' }, { status: 500 });
  }
}
