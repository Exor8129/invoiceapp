import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all customer pricing rules
export async function GET() {
  try {
    const pricingRules = await prisma.customerPricingRule.findMany({
      include: {
        party: true,
        item: true,
      },
      orderBy: {
        effective_from: "desc",
      },
    });

    return NextResponse.json(pricingRules);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing rules." }, { status: 500 });
  }
}

// POST: Add a new customer pricing rule
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      party_id,
      item_id,
      min_qty,
      fixed_price,
      effective_from,
      effective_to,
    } = body;

    const newRule = await prisma.customerPricingRule.create({
      data: {
        party_id,
        item_id,
        min_qty,
        fixed_price,
        effective_from: new Date(effective_from),
        effective_to: effective_to ? new Date(effective_to) : null,
      },
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Failed to create pricing rule." }, { status: 500 });
  }
}
