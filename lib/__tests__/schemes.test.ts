import { describe, it } from "node:test";
import assert from "node:assert";
import {
  evaluateSchemeEligibility,
  evaluateAllSchemes,
  getContextualSchemesForMedicine,
  UserProfile,
} from "../schemes";

describe("Government Scheme Eligibility Engine (/lib/schemes.ts)", () => {
  const vayVandanaScheme = {
    id: "scheme-vay-vandana",
    name: "Ayushman Bharat PM-JAY Vay Vandana (Senior Citizens 70+)",
    description: "Universal health cover for seniors aged 70 and above.",
    benefitText: "Rs. 5,00,000 cashless cover dedicated to senior citizen",
    howToApply: "Apply on beneficiary.nha.gov.in using Aadhaar OTP eKYC.",
    officialUrl: "https://beneficiary.nha.gov.in",
  };

  const pmjayScheme = {
    id: "scheme-pmjay",
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    description: "Secondary and tertiary hospitalization cover for BPL/SECC families.",
    benefitText: "Rs. 5,00,000 cashless cover per family per year",
    howToApply: "Check eligibility with Ration card at CSC.",
    officialUrl: "https://beneficiary.nha.gov.in",
  };

  const pmsmaScheme = {
    id: "scheme-pmsma",
    name: "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
    description: "Comprehensive antenatal care for pregnant women on 9th of every month.",
    benefitText: "100% free specialist antenatal checkups and vitamins",
    howToApply: "Visit nearest CHC on 9th of the month with MCP card.",
    officialUrl: "https://pmsma.nhp.gov.in",
  };

  const npncdScheme = {
    id: "scheme-npncd",
    name: "National Programme for Prevention & Control of NCDs (NP-NCD)",
    description: "Free continuous monthly prescription medicines for Diabetes and BP.",
    benefitText: "Free monthly supply of Metformin, Amlodipine, Telmisartan",
    howToApply: "Visit nearest Ayushman Arogya Mandir.",
    officialUrl: "https://npcdcs.mohfw.gov.in",
  };

  it("should qualify seniors aged 70+ for Vay Vandana universal cover regardless of income", () => {
    const profileSenior: UserProfile = {
      age: 74,
      annualIncome: 1200000, // High income, but Vay Vandana is universal
      category: "GENERAL",
      district: "Lucknow",
    };

    const result = evaluateSchemeEligibility(vayVandanaScheme, profileSenior, "en");
    assert.strictEqual(result.status, "ELIGIBLE");
    assert.ok(
      result.reasons[0].includes("age (74 years) is 70 or above"),
      "Should explain plain language age match"
    );
  });

  it("should disqualify individuals under 70 from Vay Vandana with plain-language reason", () => {
    const profileYoung: UserProfile = {
      age: 45,
      district: "Lucknow",
    };

    const result = evaluateSchemeEligibility(vayVandanaScheme, profileYoung, "en");
    assert.strictEqual(result.status, "NOT_ELIGIBLE");
    assert.ok(
      result.reasons[0].includes("Requires age 70 years or above"),
      "Should explain why they do not qualify"
    );
  });

  it("should qualify BPL or low-income households for Central PM-JAY", () => {
    const profileBPL: UserProfile = {
      age: 38,
      category: "BPL",
      annualIncome: 90000,
      district: "Lucknow",
    };

    const result = evaluateSchemeEligibility(pmjayScheme, profileBPL, "en");
    assert.strictEqual(result.status, "ELIGIBLE");
    assert.ok(
      result.reasons[0].includes("BPL") || result.reasons[0].includes("low-income"),
      "Should explain BPL / low-income qualification"
    );
  });

  it("should qualify pregnant mothers for PMSMA antenatal maternal care", () => {
    const profilePregnant: UserProfile = {
      age: 26,
      isPregnant: true,
      district: "Lucknow",
    };

    const result = evaluateSchemeEligibility(pmsmaScheme, profilePregnant, "en");
    assert.strictEqual(result.status, "ELIGIBLE");
    assert.ok(result.reasons[0].includes("antenatal checkups"));
  });

  it("should qualify chronic disease patients (Diabetes/BP) for NP-NCD free monthly refills", () => {
    const profileChronic: UserProfile = {
      age: 52,
      hasChronicCondition: true,
      district: "Lucknow",
    };

    const result = evaluateSchemeEligibility(npncdScheme, profileChronic, "en");
    assert.strictEqual(result.status, "ELIGIBLE");
    assert.ok(result.reasons[0].includes("chronic medicine supplies"));
  });

  it("should recommend contextual schemes on search/prescription for chronic diabetes medications", () => {
    const contextualBanners = getContextualSchemesForMedicine({
      medicineName: "Glycomet 500 SR",
      salts: ["Metformin"],
      isChronic: true,
    });

    assert.ok(contextualBanners.length > 0, "Should generate contextual scheme recommendation");
    assert.strictEqual(contextualBanners[0].id, "np-ncd-chronic");
    assert.ok(contextualBanners[0].title.includes("Chronic Medicine Entitlement"));
  });
});
