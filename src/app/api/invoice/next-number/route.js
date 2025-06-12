import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all invoice numbers (or a limited recent set if your table is large)
    const invoices = await prisma.saleEntry.findMany({
      select: { invoice_number: true },
    });

    let maxNumber = 0;

    for (const invoice of invoices) {
      const match = invoice.invoice_number.match(/^(\d+)\//);
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }

    const nextNumber = maxNumber + 1;
    const invoiceNumber = `${nextNumber}/25-26`;
    console.log("INVOICE NUMBER:",invoiceNumber)

    console.log("INVOICE NUMBER:", invoiceNumber);
    return NextResponse.json({ invoiceNumber });
  } catch (err) {
    console.error("❌ Error while generating invoice number:", err);
    return NextResponse.json({ error: "Failed to generate invoice number" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
