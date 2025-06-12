import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize PrismaClient
const prisma = new PrismaClient();

export async function POST(req) {
  // Parse the incoming JSON data from the request
  const body = await req.json();

  // Log the full request body for debugging
  console.log("📦 Incoming Invoice Data:", JSON.stringify(body, null, 2));

  try {
    // Create the sale entries in the database
    const entries = await Promise.all(
      body.items.map((item) =>
        prisma.saleEntry.create({
          data: {
            date: new Date(body.invoiceDate), // Use `invoiceDate` or `date` from request
            party_name: body.partyName,
            invoice_number: body.invoiceNumber,
            item_name: item.name,
            quantity: parseInt(item.qty, 10),
            sell_rate: parseFloat(item.rate),
            profit: item.profit ?? 0, // You can compute this if needed
          },
        })
      )
    );

    // Return a success response with the saved entries
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error("Failed to save sale entries:", error);
    // Return a failure response with the error message
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

//For Fetching slip and saved invoice data

