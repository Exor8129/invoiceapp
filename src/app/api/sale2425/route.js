import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const itemsdata = await prisma.SaleData2425.findMany();
    console.log("Fetched itemsdata:", itemsdata);  // <-- log here
    return NextResponse.json(itemsdata);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { itemName } = await req.json();

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    // Check for exact match
    const exactMatch = await prisma.saleData2425.findFirst({
      where: {
        item_name: itemName,
      },
    });

    if (exactMatch) {
      return NextResponse.json({
        exactMatch: true,
        match: exactMatch,
        suggestions: [],
      });
    }

    // If not found, return partial suggestions (like fuzzy match)
    const suggestions = await prisma.saleData2425.findMany({
      where: {
        item_name: {
          contains: itemName,
          mode: "insensitive",
        },
      },
      take: 10,
    });

    return NextResponse.json({
      exactMatch: false,
      suggestions,
    });
  } catch (error) {
    console.error("Error in POST /api/sale2425:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
