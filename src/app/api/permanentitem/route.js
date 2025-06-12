import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma=new PrismaClient();

export async function GET(req) {
    try{
        const items=await prisma.PermanentItem.findMany({
            select:{
                uid:true,
                name:true,
                reorder_level:true,
                product_note:true,
                supplier:true,
                udrl:true,


            },
            orderBy:{
                name:'asc'
            },
        });
        return new Response(JSON.stringify(items),{
            status:200,
            headers:{
                'content-type':'application/json',
            },
        });
    }
    catch (error) {
    console.error('Error fetching stock items:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch stock items' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}