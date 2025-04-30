// app/api/sale-entry/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path as needed

export async function POST(req) {
  const body = await req.json();

    // Log the full request body
    console.log('📦 Incoming Invoice Data:', JSON.stringify(body, null, 2));

  try {
    const entries = await Promise.all(
      body.items.map((item) =>
        prisma.sale_entry.create({
          data: {
            date: new Date(body.date),
            party_name: body.partyName,
            invoice_number: body.invoiceNumber,
            item_name: item.name,
            quantity: item.qty,
            sell_rate: item.rate,
            profit: item.profit ?? 0, // You can compute this if needed
          },
        })
      )
    );

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Failed to save sale entries:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
