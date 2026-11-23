import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET messages by orderId or storeId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const storeId = searchParams.get("storeId");
    const since = searchParams.get("since");

    if (!orderId && !storeId) {
      return NextResponse.json(
        { success: false, error: "Either orderId or storeId is required" },
        { status: 400 }
      );
    }

    const whereClause: any = {};

    if (orderId) {
      whereClause.orderId = orderId;
    } else if (storeId) {
      whereClause.storeId = storeId;
    }

    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        whereClause.createdAt = { gt: sinceDate };
      }
    }

    const messages = await db.message.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({
        id: m.id,
        orderId: m.orderId,
        storeId: m.storeId,
        userId: m.userId,
        senderRole: m.senderRole, // CITIZEN, STORE, ADMIN
        senderName:
          m.senderRole === "STORE"
            ? m.store?.name || "Pharmacist"
            : m.user?.name || "Citizen",
        text: m.text,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST new message
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, storeId, senderRole = "CITIZEN", text } = body;
    let { userId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "Message text cannot be empty" },
        { status: 400 }
      );
    }

    let resolvedStoreId = storeId;

    // If orderId is provided, get storeId and userId from the Order if not explicitly passed
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
      });
      if (order) {
        if (!resolvedStoreId) resolvedStoreId = order.storeId;
        if (!userId) userId = order.userId;
      }
    }

    // Default to the first demo citizen user if none provided
    if (!userId) {
      const defaultUser = await db.user.findFirst({
        where: { role: "CITIZEN" },
      });
      userId = defaultUser?.id || "demo-citizen";
    }

    const newMessage = await db.message.create({
      data: {
        orderId: orderId || null,
        storeId: resolvedStoreId || null,
        userId,
        senderRole,
        text: text.trim(),
      },
      include: {
        user: { select: { name: true } },
        store: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        orderId: newMessage.orderId,
        storeId: newMessage.storeId,
        userId: newMessage.userId,
        senderRole: newMessage.senderRole,
        senderName:
          newMessage.senderRole === "STORE"
            ? newMessage.store?.name || "Pharmacist"
            : newMessage.user?.name || "Citizen",
        text: newMessage.text,
        createdAt: newMessage.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
