import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  evaluateAllSchemes,
  UserProfile,
  SchemeEvaluationResult,
} from "@/lib/schemes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ageParam = searchParams.get("age");
    const incomeParam = searchParams.get("annualIncome");
    const district = searchParams.get("district") || "Lucknow";
    const category = searchParams.get("category") || "GENERAL";
    const isPregnant = searchParams.get("isPregnant") === "true";
    const hasChronicCondition =
      searchParams.get("hasChronicCondition") === "true";
    const lang = (searchParams.get("lang") || "en") as "en" | "hi";

    const age = ageParam ? parseInt(ageParam, 10) : null;
    const annualIncome = incomeParam ? parseFloat(incomeParam) : null;

    const profile: UserProfile = {
      age,
      annualIncome,
      district,
      category,
      isPregnant,
      hasChronicCondition,
    };

    const schemes = await db.scheme.findMany({
      orderBy: { name: "asc" },
    });

    const evaluatedSchemes = evaluateAllSchemes(schemes, profile, lang);

    const eligibleCount = evaluatedSchemes.filter(
      (s) => s.status === "ELIGIBLE"
    ).length;
    const maybeCount = evaluatedSchemes.filter(
      (s) => s.status === "MAYBE"
    ).length;

    return NextResponse.json({
      success: true,
      total: evaluatedSchemes.length,
      eligibleCount,
      maybeCount,
      profile,
      schemes: evaluatedSchemes,
    });
  } catch (error) {
    console.error("Schemes GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load government schemes" },
      { status: 500 }
    );
  }
}

// POST Eligibility Evaluator & Optional Profile Saver
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      age = null,
      annualIncome = null,
      district = "Lucknow",
      category = "GENERAL",
      isPregnant = false,
      hasChronicCondition = false,
      saveProfile = false,
      userId = null,
      phone = null,
      lang = "en",
    } = body;

    const profile: UserProfile = {
      age: typeof age === "number" ? age : null,
      annualIncome: typeof annualIncome === "number" ? annualIncome : null,
      district: district || "Lucknow",
      category: category || "GENERAL",
      isPregnant: Boolean(isPregnant),
      hasChronicCondition: Boolean(hasChronicCondition),
    };

    // If citizen gave explicit consent, persist to User record
    if (saveProfile) {
      try {
        let userToUpdate = null;
        if (userId) {
          userToUpdate = await db.user.findUnique({ where: { id: userId } });
        } else if (phone) {
          userToUpdate = await db.user.findUnique({ where: { phone } });
        } else {
          // Default demo citizen: Ram Swaroop Shukla or first citizen
          userToUpdate = await db.user.findFirst({
            where: { role: "CITIZEN" },
          });
        }

        if (userToUpdate) {
          await db.user.update({
            where: { id: userToUpdate.id },
            data: {
              age: profile.age ?? userToUpdate.age,
              district: profile.district ?? userToUpdate.district,
              annualIncome: profile.annualIncome ?? userToUpdate.annualIncome,
              category: profile.category ?? userToUpdate.category,
              hasChronicCondition:
                profile.hasChronicCondition ?? userToUpdate.hasChronicCondition,
            },
          });
        }
      } catch (err) {
        console.warn("Could not persist user profile to DB:", err);
      }
    }

    const schemes = await db.scheme.findMany({
      orderBy: { name: "asc" },
    });

    const evaluatedSchemes = evaluateAllSchemes(schemes, profile, lang);

    const eligibleSchemes = evaluatedSchemes.filter(
      (s) => s.status === "ELIGIBLE"
    );
    const maybeSchemes = evaluatedSchemes.filter((s) => s.status === "MAYBE");

    return NextResponse.json({
      success: true,
      profileSaved: saveProfile,
      eligibleCount: eligibleSchemes.length,
      maybeCount: maybeSchemes.length,
      profile,
      schemes: evaluatedSchemes,
    });
  } catch (error) {
    console.error("Schemes POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to evaluate scheme eligibility" },
      { status: 500 }
    );
  }
}
