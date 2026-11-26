import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      storesCount,
      medicinesCount,
      inventoryCount,
      ordersCount,
      searchEventsCount,
      schemesCount,
      usersCount,
    ] = await Promise.all([
      prisma.store.count(),
      prisma.medicine.count(),
      prisma.inventory.count(),
      prisma.order.count(),
      prisma.searchEvent.count(),
      prisma.scheme.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      status: "ready",
      counts: {
        stores: storesCount,
        medicines: medicinesCount,
        inventory: inventoryCount,
        orders: ordersCount,
        searchEvents: searchEventsCount,
        schemes: schemesCount,
        users: usersCount,
      },
      lastResetAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn("Failed to query live system stats in /api/admin/reset:", err);
    // Return baseline fallback so page/build does not crash
    return NextResponse.json({
      status: "degraded",
      counts: {
        stores: 30,
        medicines: 77,
        inventory: 1361,
        orders: 1,
        searchEvents: 425,
        schemes: 8,
        users: 6,
      },
      lastResetAt: new Date().toISOString(),
      error: err.message,
    });
  }
}

export async function POST() {
  try {
    // 1. Reset temporary test holds and messages
    await prisma.message.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();

    // 2. Ensure default demo users exist or are updated
    const ramSwaroop = await prisma.user.upsert({
      where: { phone: "+91 98390 12001" },
      update: {
        savedTotal: 3450.0,
        hasChronicCondition: true,
        age: 72,
        annualIncome: 180000,
        category: "GENERAL",
      },
      create: {
        name: "Ram Swaroop Shukla",
        phone: "+91 98390 12001",
        language: "hi",
        age: 72,
        annualIncome: 180000,
        category: "GENERAL",
        district: "Lucknow",
        hasChronicCondition: true,
        savedTotal: 3450.0,
        role: "CITIZEN",
      },
    });

    // 3. Reset inventory stocks to robust baseline
    await prisma.inventory.updateMany({
      where: {
        quantity: { lt: 5 },
      },
      data: {
        quantity: 25,
      },
    });

    // 4. Ensure recent 3-day fever surge in Chowk is fresh relative to now
    const now = new Date();
    const paracetamolSalt = await prisma.salt.findFirst({
      where: { name: { contains: "Paracetamol" } },
    });

    if (paracetamolSalt) {
      // Clean up search events older than 30 days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      await prisma.searchEvent.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo } },
      });

      // Insert 25 fresh search events over the last 3 days in Chowk & Alambagh
      const recentSurgeEvents = [];
      for (let i = 0; i < 25; i++) {
        const hoursAgo = Math.floor(Math.random() * 60); // within last 2.5 days
        const eventTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        recentSurgeEvents.push({
          query: i % 2 === 0 ? "Dolo 650" : "Paracetamol",
          saltId: paracetamolSalt.id,
          area: i % 3 === 0 ? "Alambagh" : "Chowk",
          lat: 26.868 + (Math.random() - 0.5) * 0.01,
          lng: 80.912 + (Math.random() - 0.5) * 0.01,
          createdAt: eventTime,
        });
      }

      await prisma.searchEvent.createMany({
        data: recentSurgeEvents,
      });
    }

    // 5. Create a completed sample order so lifetime savings counter is populated
    const firstStore = await prisma.store.findFirst({
      where: { type: "JAN_AUSHADHI" },
    });

    const sampleMed = await prisma.medicine.findFirst({
      where: { isJanAushadhi: true },
    });

    if (firstStore && sampleMed && ramSwaroop) {
        await prisma.order.create({
          data: {
            userId: ramSwaroop.id,
            storeId: firstStore.id,
            status: "COMPLETED",
            mode: "PICKUP",
            totalPaid: 18.0,
            totalMrpBaseline: 145.0,
            savings: 127.0,
            items: {
              create: [
                {
                  medicineId: sampleMed.id,
                  quantity: 1,
                  unitPrice: 18.0,
                  baselinePrice: 145.0,
                },
              ],
            },
          },
        });
      }

    // Query updated stats
    const [stores, medicines, inventory, orders, searchEvents, schemes, users] =
        await Promise.all([
          prisma.store.count(),
          prisma.medicine.count(),
          prisma.inventory.count(),
          prisma.order.count(),
          prisma.searchEvent.count(),
          prisma.scheme.count(),
          prisma.user.count(),
        ]);

      return NextResponse.json({
        success: true,
        message: "Database demo state successfully refreshed for hackathon evaluation.",
        timestamp: new Date().toISOString(),
        counts: {
          stores,
          medicines,
          inventory,
          orders,
          searchEvents,
          schemes,
          users,
        },
      });
    } catch (err: any) {
      console.error("Admin reset error:", err);
      return NextResponse.json(
        { error: err.message || "Failed to reset demo state" },
        { status: 500 }
      );
    }
  }
