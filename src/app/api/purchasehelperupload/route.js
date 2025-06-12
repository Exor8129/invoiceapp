import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to parse DD-MM-YYYY format to a valid Date object
function parseDDMMYYYY(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const isoDateStr = `${yyyy}-${mm}-${dd}`;
  const dateObj = new Date(isoDateStr);
  return isNaN(dateObj.getTime()) ? null : dateObj;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { salesData, stockData } = body;

    console.log("Received stockData sample:", stockData?.slice(0, 3));
    console.log("Received salesData sample:", salesData?.slice(0, 3));

    // Truncate both tables first
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE salesbyitem RESTART IDENTITY CASCADE`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE stockitem RESTART IDENTITY CASCADE`);

    // Prepare sales data with validated dates
    let salesToInsert = [];
    if (Array.isArray(salesData)) {
      salesToInsert = salesData.map((item, idx) => {
        const dateObj = parseDDMMYYYY(item.Date);
        if (!dateObj) {
          console.error(`Invalid date at salesData[${idx}]:`, item.Date);
        }
        return {
          date: dateObj,
          itemname: item.ItemName,
          qty: Number(item.Qty),
        };
      });

      // Filter out any entries with invalid dates
      salesToInsert = salesToInsert.filter(item => item.date !== null);

      if (salesToInsert.length > 0) {
        await prisma.salesByItem.createMany({ data: salesToInsert });
      }
    }

    // Prepare and insert stock data
    if (Array.isArray(stockData)) {
      const stockToInsert = stockData
        .map((item, idx) => {
          if (!item.Name) {
            console.error(`Missing name at stockData[${idx}]:`, item);
            return null;
          }

          return {
            uid: String(item.UID),
            name: item.Name,
            hsncode: item.HSNCode || null,
            buyingprice: parseFloat(item.BuyingPrice),
            supplier: item.Supplier || null,
            tax: item.Tax ? parseFloat(item.Tax) : null,
            stock: Number(item.Stock),
          };
        })
        .filter(Boolean); // remove nulls

      if (stockToInsert.length > 0) {
        await prisma.stockItem.createMany({ data: stockToInsert });
      } else {
        console.warn('No valid stock items to insert.');
      }
    }

    return NextResponse.json({ message: 'Upload successful' }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
export async function GET(req) {
  try {
    const items = await prisma.stockItem.findMany({
      select: {
        uid: true,
        name: true,
        stock:true,

      },
      orderBy: {
        name: 'asc',
      },
    });

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching stock items:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stock items' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}