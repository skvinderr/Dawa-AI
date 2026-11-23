import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schemes = await db.scheme.findMany({
      orderBy: { name: "asc" },
    });

    const parsedSchemes = schemes.map((s) => {
      let eligibilityObj: any = {};
      try {
        eligibilityObj = JSON.parse(s.eligibility);
      } catch (e) {
        eligibilityObj = { text: s.eligibility };
      }

      // Determine category bucket
      const nameLower = s.name.toLowerCase();
      let categoryBucket = "GENERAL";
      if (nameLower.includes("pm-jay") || nameLower.includes("jan arogya") || nameLower.includes("vay vandana")) {
        categoryBucket = "HOSPITAL";
      } else if (nameLower.includes("janaushadhi") || nameLower.includes("free drugs")) {
        categoryBucket = "GENERIC_MEDICINES";
      } else if (nameLower.includes("matritva") || nameLower.includes("rbsk") || nameLower.includes("bal")) {
        categoryBucket = "MATERNAL_CHILD";
      } else if (nameLower.includes("ncd") || nameLower.includes("tb") || nameLower.includes("nikshay")) {
        categoryBucket = "CHRONIC_SPECIAL";
      }

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        benefitText: s.benefitText,
        howToApply: s.howToApply,
        officialUrl: s.officialUrl,
        categoryBucket,
        eligibility: eligibilityObj,
      };
    });

    return NextResponse.json({
      success: true,
      total: parsedSchemes.length,
      schemes: parsedSchemes,
    });
  } catch (error) {
    console.error("Schemes GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load government schemes" },
      { status: 500 }
    );
  }
}

// POST Eligibility Evaluator
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      age = 35,
      annualIncome = 150000,
      category = "GENERAL",
      isPregnant = false,
      hasDiabetesOrBP = false,
      hasTB = false,
      needsHospitalization = false,
    } = body;

    const schemes = await db.scheme.findMany();
    const qualified: any[] = [];
    let coverageValue = 0;

    schemes.forEach((s) => {
      let el: any = {};
      try {
        el = JSON.parse(s.eligibility);
      } catch (e) {
        el = {};
      }

      const nameLower = s.name.toLowerCase();
      let isEligible = false;
      let matchReason = "";

      // 1. Vay Vandana (70+ seniors)
      if (nameLower.includes("vay vandana")) {
        if (age >= 70) {
          isEligible = true;
          matchReason = "Age is 70+ years (universal coverage regardless of income).";
          coverageValue += 500000;
        }
      }
      // 2. Ayushman Bharat PM-JAY
      else if (nameLower.includes("pm-jay") && !nameLower.includes("vay vandana")) {
        if (
          category === "BPL" ||
          category === "ANTYODAYA" ||
          category === "EWS" ||
          annualIncome <= 120000
        ) {
          isEligible = true;
          matchReason = "Eligible under low-income / BPL / Antyodaya deprivation criteria.";
          if (coverageValue < 500000) coverageValue += 500000;
        }
      }
      // 3. UP Mukhyamantri Jan Arogya Yojana
      else if (nameLower.includes("mukhyamantri jan arogya")) {
        if (category === "ANTYODAYA" || category === "BPL" || annualIncome <= 180000) {
          isEligible = true;
          matchReason = "Uttar Pradesh state health cover for vulnerable / Antyodaya households.";
        }
      }
      // 4. PM Jan Aushadhi (PMBJP)
      else if (nameLower.includes("janaushadhi")) {
        isEligible = true;
        matchReason = "Universal entitlement for all Indian citizens with valid prescription.";
      }
      // 5. UP Free Drugs Initiative
      else if (nameLower.includes("free drugs")) {
        isEligible = true;
        matchReason = "Universal free essential drugs across all UP government hospitals and CHCs.";
      }
      // 6. PMSMA (Maternal Care)
      else if (nameLower.includes("matritva")) {
        if (isPregnant && age >= 18 && age <= 45) {
          isEligible = true;
          matchReason = "Pregnant woman in 2nd or 3rd trimester entitled to free checkups and vitamins.";
        }
      }
      // 7. RBSK (Pediatric / Child)
      else if (nameLower.includes("rbsk") || nameLower.includes("bal")) {
        if (age <= 18) {
          isEligible = true;
          matchReason = "Child or adolescent under 18 covered for 4D screening and management.";
        }
      }
      // 8. NP-NCD (Chronic Diabetes & Hypertension)
      else if (nameLower.includes("ncd")) {
        if (age >= 30 && hasDiabetesOrBP) {
          isEligible = true;
          matchReason = "Free lifelong monthly supply of BP & Diabetes medicines through UP Health & Wellness Centres.";
        } else if (age >= 30) {
          isEligible = true;
          matchReason = "Age 30+ eligible for free routine screening and chronic disease prevention.";
        }
      }

      if (isEligible) {
        qualified.push({
          id: s.id,
          name: s.name,
          benefitText: s.benefitText,
          matchReason,
          howToApply: s.howToApply,
          officialUrl: s.officialUrl,
        });
      }
    });

    return NextResponse.json({
      success: true,
      evaluatedFor: {
        age,
        category,
        annualIncome,
        isPregnant,
        hasDiabetesOrBP,
      },
      qualifiedCount: qualified.length,
      coverageEstimateText:
        coverageValue > 0
          ? `Up to ₹${coverageValue.toLocaleString("en-IN")} Cashless In-Patient Hospital Cover + Free Outpatient Medicines`
          : "Free Essential Medications & 50-90% Jan Aushadhi Generic Subsidies",
      qualified,
    });
  } catch (error) {
    console.error("Eligibility evaluator error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to evaluate scheme eligibility" },
      { status: 500 }
    );
  }
}
