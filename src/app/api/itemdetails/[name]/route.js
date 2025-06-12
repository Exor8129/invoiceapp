import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, context) {
  const { name } = await context.params; // ✅ fix: await params

  try {
    const item = await prisma.stockItem.findFirst({ // ⬇ see next fix
      where: { name },
      select: {
        uid: true,
        name: true,
        hsncode: true,
        buyingprice: true,
        supplier: true,
        tax: true,
        stock: true,
      },
    });

    const sales = await prisma.SalesByItem.findMany({
      where: { itemname: name },
      select: { date: true, qty: true },
    });

    return Response.json({ item, sales });
  } catch (err) {
    console.error(err);
    return new Response('Failed to fetch item details', { status: 500 });
  }
}

