/**
 * DawaaSetu - Government Health Scheme Eligibility Evaluation Engine
 * Validates citizen profile against Central and Uttar Pradesh Health Schemes
 */

export interface UserProfile {
  age?: number | null;
  district?: string | null;
  annualIncome?: number | null;
  category?: string | null; // "BPL" | "GENERAL" | "EWS" | "SC" | "ST" | "OBC" | "ANTYODAYA"
  isPregnant?: boolean | null;
  hasChronicCondition?: boolean | null;
}

export type SchemeEligibilityStatus = "ELIGIBLE" | "MAYBE" | "NOT_ELIGIBLE";

export interface SchemeEvaluationResult {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  status: SchemeEligibilityStatus;
  reasons: string[];
  reasonsHi: string[];
  benefitText: string;
  benefitTextHi: string;
  howToApply: string;
  howToApplyHi: string;
  documentsNeeded: string[];
  documentsNeededHi: string[];
  officialUrl: string;
  categoryBucket: "SENIOR" | "HOSPITAL" | "CHRONIC" | "MATERNAL" | "CHILD" | "UNIVERSAL";
  indicativeCoverage: string;
}

// Translations and metadata for all 8 UP & Central Health Schemes
export const SCHEME_METADATA: Record<
  string,
  {
    nameHi: string;
    descriptionHi: string;
    benefitTextHi: string;
    howToApplyHi: string;
    documentsNeeded: string[];
    documentsNeededHi: string[];
    categoryBucket: "SENIOR" | "HOSPITAL" | "CHRONIC" | "MATERNAL" | "CHILD" | "UNIVERSAL";
    indicativeCoverage: string;
  }
> = {
  "Ayushman Bharat PM-JAY Vay Vandana (Senior Citizens 70+)": {
    nameHi: "आयुष्मान भारत वय वंदना योजना (70+ वरिष्ठ नागरिक)",
    descriptionHi:
      "70 वर्ष और उससे अधिक आयु के सभी वरिष्ठ नागरिकों के लिए सार्वभौमिक ₹5 लाख का समर्पित निःशुल्क स्वास्थ्य बीमा, परिवार की आय चाहे जो भी हो।",
    benefitTextHi: "₹5,00,000 का निःशुल्क समर्पित कैशलेस स्वास्थ्य कवर प्रति वर्ष",
    howToApplyHi:
      "beneficiary.nha.gov.in पर जाएं या आयुष्मान ऐप से आधार ओटीपी ई-केवाईसी द्वारा अपना विशेष वय वंदना कार्ड बनाएं।",
    documentsNeeded: ["Aadhaar Card (Showing 70+ age)", "Mobile linked with Aadhaar", "Recent Passport Photo"],
    documentsNeededHi: ["आधार कार्ड (70+ आयु प्रमाण)", "आधार लिंक मोबाइल नंबर", "पासपोर्ट साइज फोटो"],
    categoryBucket: "SENIOR",
    indicativeCoverage: "₹5,00,000 / Year",
  },
  "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)": {
    nameHi: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (PM-JAY)",
    descriptionHi:
      "गरीब और वंचित परिवारों के लिए प्रति वर्ष ₹5 लाख का कैशलेस अस्पताल इलाज। सरकारी एवं संबद्ध निजी अस्पतालों में संपूर्ण दवाएं और इलाज निःशुल्क।",
    benefitTextHi: "₹5,00,000 प्रति परिवार प्रति वर्ष कैशलेस अस्पताल भर्ती एवं दवा कवर",
    howToApplyHi:
      "निकटतम जन सेवा केंद्र (CSC), जिला अस्पताल के आयुष्मान मित्र से संपर्क करें या beneficiary.nha.gov.in पर राशन कार्ड से पात्रता जांचें।",
    documentsNeeded: ["Ration Card (Patra Grihasthi / AAY)", "Aadhaar Card", "Income / Caste Certificate (if applicable)"],
    documentsNeededHi: ["राशन कार्ड (पात्र गृहस्थी / अंत्योदय)", "आधार कार्ड", "आय / जाति प्रमाण पत्र (यदि लागू हो)"],
    categoryBucket: "HOSPITAL",
    indicativeCoverage: "₹5,00,000 / Year",
  },
  "Mukhyamantri Jan Arogya Yojana (UP State Health Scheme)": {
    nameHi: "मुख्यमंत्री जन आरोग्य योजना (उत्तर प्रदेश)",
    descriptionHi:
      "उत्तर प्रदेश सरकार द्वारा संचालित योजना जो उन पात्र परिवारों को ₹5 लाख का निःशुल्क इलाज देती है जो केंद्रीय आयुष्मान सूची में शामिल नहीं हैं।",
    benefitTextHi: "₹5,00,000 का राज्य पोषित कैशलेस अस्पताल इलाज एवं दवा सुरक्षा",
    howToApplyHi:
      "उत्तर प्रदेश राशन कार्ड अथवा BOCW श्रम कार्ड लेकर निकटतम जन सेवा केंद्र पर जाएं और अपना यूपी जन आरोग्य कार्ड बनवाएं।",
    documentsNeeded: ["UP Ration Card", "BOCW Shramik Card (if construction worker)", "UP Domicile / Aadhaar Card"],
    documentsNeededHi: ["उत्तर प्रदेश राशन कार्ड", "श्रम कार्ड (यदि पंजीकृत श्रमिक हैं)", "यूपी निवास प्रमाण / आधार कार्ड"],
    categoryBucket: "HOSPITAL",
    indicativeCoverage: "₹5,00,000 / Year",
  },
  "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)": {
    nameHi: "प्रधानमंत्री सुरक्षित मातृत्व अभियान (PMSMA)",
    descriptionHi:
      "गर्भवती महिलाओं को हर महीने की 9 तारीख को सभी सरकारी स्वास्थ्य केंद्रों पर विशेषज्ञ डॉक्टरों द्वारा 100% निःशुल्क जांच, अल्ट्रासाउंड एवं दवाएं।",
    benefitTextHi: "निःशुल्क विशेषज्ञ प्रसव पूर्व जांच, अल्ट्रासाउंड, आयरन-कैल्शियम व फोलिक एसिड दवाएं",
    howToApplyHi:
      "हर महीने की 9 तारीख को अपनी मातृ एवं बाल सुरक्षा (MCP) डायरी लेकर निकटतम सरकारी अस्पताल या CHC में जाएं।",
    documentsNeeded: ["Mother & Child Protection (MCP) Card", "Aadhaar Card", "Previous Doctor Prescription"],
    documentsNeededHi: ["मातृ एवं बाल सुरक्षा (MCP) कार्ड", "आधार कार्ड", "पिछला डॉक्टरी पर्चा"],
    categoryBucket: "MATERNAL",
    indicativeCoverage: "100% Free Antenatal Care",
  },
  "National Programme for Prevention & Control of NCDs (NP-NCD)": {
    nameHi: "राष्ट्रीय असंक्रामक रोग निवारण कार्यक्रम (NP-NCD)",
    descriptionHi:
      "डायबिटीज (शुगर), हाई ब्लड प्रेशर एवं हृदय रोग से पीड़ित मरीजों के लिए सरकारी आरोग्य मंदिरों से हर महीने आजीवन मुफ्त दवाएं।",
    benefitTextHi: "मेटफॉर्मिन, एम्लोडिपिन, टेल्मिसार्टन आदि दवाओं की मुफ्त निरंतर मासिक आपूर्ति",
    howToApplyHi:
      "निकटतम आयुष्मान आरोग्य मंदिर / पीएचसी पर जाएं, अपनी जांच (CBAC) कराएं और हर महीने मुफ्त दवा प्राप्त करें।",
    documentsNeeded: ["Government Health Card / OPD Slip", "Aadhaar Card", "Doctor Prescription for Diabetes/BP"],
    documentsNeededHi: ["सरकारी ओपीडी पर्ची", "आधार कार्ड", "डायबिटीज/बीपी का डॉक्टरी पर्चा"],
    categoryBucket: "CHRONIC",
    indicativeCoverage: "Free Monthly Medicines",
  },
  "Free Drugs Service Initiative (UP State Public Health)": {
    nameHi: "उत्तर प्रदेश निःशुल्क औषधि सेवा योजना (UP EDL)",
    descriptionHi:
      "उत्तर प्रदेश के सभी जिला अस्पतालों, मेडिकल कॉलेजों, CHC और PHC में 300+ आवश्यक दवाओं की 100% मुफ्त सरकारी फार्मेसी से आपूर्ति।",
    benefitTextHi: "सरकारी डॉक्टर के पर्चे पर 300+ आवश्यक दवाओं (EDL) का 100% मुफ्त वितरण",
    howToApplyHi:
      "केजीएमयू, सिविल अस्पताल, बलरामपुर अस्पताल या किसी भी सरकारी अस्पताल में ₹1 की ओपीडी पर्ची बनवाएं और काउंटर से मुफ्त दवा लें।",
    documentsNeeded: ["Hospital OPD / IPD Slip", "Aadhaar Card (Optional for OPD)"],
    documentsNeededHi: ["सरकारी अस्पताल की ओपीडी पर्ची", "आधार कार्ड (वैकल्पिक)"],
    categoryBucket: "UNIVERSAL",
    indicativeCoverage: "100% Free at Govt Hospitals",
  },
  "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)": {
    nameHi: "प्रधानमंत्री भारतीय जन औषधि परियोजना (PMBJP)",
    descriptionHi:
      "ब्रांडेड दवाओं की तुलना में 50% से 90% तक कम कीमत पर उच्च गुणवत्ता वाली जेनेरिक दवाओं की पूरे देश और लखनऊ में उपलब्धता।",
    benefitTextHi: "1,800+ दवाओं और 290+ सर्जिकल उपकरणों पर 50% से 90% तक सीधी बचत",
    howToApplyHi:
      "डॉक्टर का पर्चा लेकर लखनऊ के किसी भी 6+ जन औषधि केंद्र पर जाएं और सीधे काउंटर से रियायती दर पर दवा खरीदें।",
    documentsNeeded: ["Doctor Prescription (For scheduled medicines)", "No income proof needed"],
    documentsNeededHi: ["डॉक्टर का पर्चा (शेड्यूल्ड दवाओं हेतु)", "आय प्रमाण की आवश्यकता नहीं"],
    categoryBucket: "UNIVERSAL",
    indicativeCoverage: "50% - 90% Price Discount",
  },
  "Rashtriya Bal Swasthya Karyakram (RBSK)": {
    nameHi: "राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (RBSK)",
    descriptionHi:
      "0 से 18 वर्ष तक के बच्चों और किशोरों के जन्मजात दोष, कमियों, बीमारियों और विकलांगता की मुफ्त पहचान, सर्जरी और बाल चिकित्सा दवाएं।",
    benefitTextHi: "30+ गंभीर बाल रोगों की मुफ्त पहचान, अस्पताल सर्जरी और बाल चिकित्सा दवाएं",
    howToApplyHi:
      "आंगनवाड़ी केंद्र, सरकारी स्कूल स्वास्थ्य समन्वयक अथवा लखनऊ जिला अस्पताल के DEIC केंद्र से संपर्क करें।",
    documentsNeeded: ["Child Birth Certificate / School ID", "Parent Aadhaar Card", "RBSK Screening Card"],
    documentsNeededHi: ["बच्चे का जन्म प्रमाण पत्र / स्कूल आईडी", "माता-पिता का आधार कार्ड", "स्क्रीनिंग कार्ड"],
    categoryBucket: "CHILD",
    indicativeCoverage: "Free Pediatric Care & Surgery",
  },
};

/**
 * Evaluates a single scheme's eligibility based on a citizen's profile
 */
export function evaluateSchemeEligibility(
  scheme: {
    id: string;
    name: string;
    description: string;
    eligibility?: string;
    benefitText: string;
    howToApply: string;
    officialUrl?: string | null;
  },
  profile: UserProfile,
  language: "en" | "hi" = "en"
): SchemeEvaluationResult {
  const name = scheme.name.trim();
  const meta = SCHEME_METADATA[name] || {
    nameHi: name,
    descriptionHi: scheme.description,
    benefitTextHi: scheme.benefitText,
    howToApplyHi: scheme.howToApply,
    documentsNeeded: ["Aadhaar Card", "Doctor Prescription"],
    documentsNeededHi: ["आधार कार्ड", "डॉक्टर का पर्चा"],
    categoryBucket: "UNIVERSAL" as const,
    indicativeCoverage: "Universal Access",
  };

  const nameLower = name.toLowerCase();
  const reasonsEn: string[] = [];
  const reasonsHi: string[] = [];
  let status: SchemeEligibilityStatus = "NOT_ELIGIBLE";

  const {
    age,
    annualIncome,
    category,
    isPregnant,
    hasChronicCondition,
    district = "Lucknow",
  } = profile;

  const isBPL =
    category === "BPL" ||
    category === "ANTYODAYA" ||
    category === "EWS" ||
    category === "SC" ||
    category === "ST" ||
    (typeof annualIncome === "number" && annualIncome <= 250000);

  // 1. Vay Vandana (Strictly 70+ Senior Citizens)
  if (nameLower.includes("vay vandana")) {
    if (typeof age === "number" && age >= 70) {
      status = "ELIGIBLE";
      reasonsEn.push(
        `You qualify because your age (${age} years) is 70 or above. Universal ₹5,00,000 top-up cover applies with no income ceiling.`
      );
      reasonsHi.push(
        `आप पात्र हैं क्योंकि आपकी आयु (${age} वर्ष) 70 या उससे अधिक है। बिना किसी आय सीमा के ₹5,00,000 का समर्पित स्वास्थ्य कवर उपलब्ध है।`
      );
    } else if (typeof age === "number" && age < 70) {
      status = "NOT_ELIGIBLE";
      reasonsEn.push(
        `Requires age 70 years or above. Your profile age is currently ${age} years.`
      );
      reasonsHi.push(
        `इसके लिए 70 वर्ष या उससे अधिक आयु आवश्यक है। आपकी आयु अभी ${age} वर्ष है।`
      );
    } else {
      status = "MAYBE";
      reasonsEn.push(
        "Please specify your age in the profile. Universal coverage is granted for all seniors aged 70 and above."
      );
      reasonsHi.push(
        "कृपया अपनी आयु दर्ज करें। 70 वर्ष या उससे अधिक आयु के सभी नागरिकों को यह योजना स्वतः मिलती है।"
      );
    }
  }

  // 2. Ayushman Bharat PM-JAY (Central Scheme)
  else if (nameLower.includes("pm-jay") && !nameLower.includes("vay vandana")) {
    if (isBPL) {
      status = "ELIGIBLE";
      reasonsEn.push(
        `You qualify under the ${category || "low-income"} low-income household category for ₹5,00,000 cashless family hospitalisation.`
      );
      reasonsHi.push(
        `आप ${category || "कम आय"} श्रेणी के तहत परिवार हेतु ₹5,00,000 के निःशुल्क कैशलेस अस्पताल इलाज के लिए पात्र हैं।`
      );
    } else if (category === "GENERAL" && (annualIncome || 0) > 250000) {
      status = "MAYBE";
      reasonsEn.push(
        "Central PM-JAY primarily prioritizes SECC-deprivation and BPL households. Check your Ration Card at nearest CSC."
      );
      reasonsHi.push(
        "केंद्रीय PM-JAY मुख्य रूप से वंचित व बीपीएल परिवारों के लिए है। राशन कार्ड से निकटतम जन सेवा केंद्र पर नाम जांचें।"
      );
    } else {
      status = "ELIGIBLE";
      reasonsEn.push(
        "You are likely eligible based on preliminary income guidelines. Verify inclusion at nearest CSC or District Hospital."
      );
      reasonsHi.push(
        "आय व आवासीय मानकों के आधार पर आप पात्र हो सकते हैं। निकटतम अस्पताल या CSC पर पुष्टि करें।"
      );
    }
  }

  // 3. Mukhyamantri Jan Arogya Yojana (UP State Specific)
  else if (nameLower.includes("mukhyamantri") || nameLower.includes("jan arogya yojana")) {
    const isUP = !district || district.toLowerCase() !== "other";
    if (isUP && (isBPL || (annualIncome || 0) <= 300000)) {
      status = "ELIGIBLE";
      reasonsEn.push(
        "You qualify as an Uttar Pradesh resident family under state-sponsored ₹5,00,000 cashless insurance."
      );
      reasonsHi.push(
        "उत्तर प्रदेश निवासी परिवार के रूप में आप राज्य सरकार के ₹5,00,000 स्वास्थ्य सुरक्षा कवर हेतु पात्र हैं।"
      );
    } else if (isUP) {
      status = "MAYBE";
      reasonsEn.push(
        "Valid for UP residents with Antyodaya, Patra Grihasthi, or registered construction worker cards."
      );
      reasonsHi.push(
        "उत्तर प्रदेश के अंत्योदय, पात्र गृहस्थी राशन कार्ड धारकों और पंजीकृत निर्माण श्रमिकों के लिए मान्य।"
      );
    } else {
      status = "NOT_ELIGIBLE";
      reasonsEn.push("Only applicable to residents of Uttar Pradesh.");
      reasonsHi.push("यह योजना केवल उत्तर प्रदेश के मूल निवासियों के लिए लागू है।");
    }
  }

  // 4. PMSMA (Maternal Health)
  else if (nameLower.includes("matritva") || nameLower.includes("pmsma")) {
    if (isPregnant) {
      status = "ELIGIBLE";
      reasonsEn.push(
        "You qualify for 100% free specialist antenatal checkups, ultrasounds, and maternal vitamins on the 9th of every month."
      );
      reasonsHi.push(
        "आप हर महीने की 9 तारीख को सरकारी अस्पतालों में 100% निःशुल्क विशेषज्ञ जांच, अल्ट्रासाउंड और दवाओं की पात्र हैं।"
      );
    } else if (isPregnant === false) {
      status = "NOT_ELIGIBLE";
      reasonsEn.push(
        "This program is exclusively designed for maternal care during pregnancy."
      );
      reasonsHi.push("यह कार्यक्रम विशेष रूप से गर्भवती महिलाओं के मातृत्व स्वास्थ्य के लिए है।");
    } else {
      status = "MAYBE";
      reasonsEn.push(
        "Mark 'Pregnant: Yes' in your profile if you require antenatal checkups and maternal supplements."
      );
      reasonsHi.push("यदि आप गर्भवती हैं तो प्रोफाइल में 'हां' चुनें और 9 तारीख को मुफ्त लाभ लें।");
    }
  }

  // 5. NP-NCD (Chronic Conditions: Diabetes, BP, Heart)
  else if (nameLower.includes("ncd") || nameLower.includes("prevention")) {
    if (hasChronicCondition || (typeof age === "number" && age >= 30)) {
      status = "ELIGIBLE";
      reasonsEn.push(
        hasChronicCondition
          ? "You qualify for free monthly chronic medicine supplies (Diabetes, BP, Heart) at your local Ayushman Arogya Mandir."
          : `You qualify as an adult (${age} years) for free non-communicable disease screening and preventive drug supplies.`
      );
      reasonsHi.push(
        hasChronicCondition
          ? "आप नजदीकी आयुष्मान आरोग्य मंदिर से डायबिटीज एवं बीपी की निःशुल्क मासिक दवाओं के लिए पात्र हैं।"
          : `30+ वर्ष आयु होने के कारण आप निःशुल्क स्वास्थ्य जांच एवं जीवनशैली रोग दवाओं के पात्र हैं।`
      );
    } else {
      status = "MAYBE";
      reasonsEn.push(
        "Available to all adults aged 30+ or anyone diagnosed with hypertension or diabetes."
      );
      reasonsHi.push(
        "30 वर्ष से अधिक आयु या उच्च रक्तचाप अथवा मधुमेह से पीड़ित सभी व्यक्तियों के लिए उपलब्ध।"
      );
    }
  }

  // 6. Free Drugs Service Initiative (UP State Public Health)
  else if (nameLower.includes("free drugs") || nameLower.includes("edl")) {
    status = "ELIGIBLE";
    reasonsEn.push(
      "Universal entitlement for all Uttar Pradesh residents: 100% free essential medicines with a doctor OPD slip at any UP Govt hospital."
    );
    reasonsHi.push(
      "उत्तर प्रदेश के सभी नागरिकों के लिए सार्वभौमिक अधिकार: सरकारी डॉक्टर के पर्चे पर 300+ दवाएं अस्पताल काउंटर पर पूरी तरह निःशुल्क।"
    );
  }

  // 7. PMBJP (Jan Aushadhi Generics)
  else if (nameLower.includes("janaushadhi") || nameLower.includes("pmbjp")) {
    status = "ELIGIBLE";
    reasonsEn.push(
      "Universal access for all citizens: 50% to 90% direct retail savings on 1,800+ quality generic medicines at any Jan Aushadhi Kendra."
    );
    reasonsHi.push(
      "सार्वभौमिक अधिकार: सभी नागरिक जन औषधि केंद्रों से 50% से 90% कम कीमत पर उच्च गुणवत्ता वाली जेनेरिक दवाएं खरीद सकते हैं।"
    );
  }

  // 8. RBSK (Pediatric 0-18)
  else if (nameLower.includes("rbsk") || nameLower.includes("bal swasthya")) {
    if (typeof age === "number" && age <= 18) {
      status = "ELIGIBLE";
      reasonsEn.push(
        `You qualify as a child/adolescent (${age} years) for free screening and specialized management of 30+ childhood conditions.`
      );
      reasonsHi.push(
        `आप (${age} वर्ष) 0-18 वर्ष बाल वर्ग के तहत 30+ बीमारियों की मुफ्त पहचान, सर्जरी और बाल चिकित्सा के पात्र हैं।`
      );
    } else if (typeof age === "number" && age > 18) {
      status = "NOT_ELIGIBLE";
      reasonsEn.push(
        `Dedicated pediatric healthcare program exclusively for ages 0 to 18 years (Your age is ${age}).`
      );
      reasonsHi.push(
        `यह योजना विशेष रूप से 0 से 18 वर्ष के बच्चों हेतु है (आपकी दर्ज आयु ${age} वर्ष है)।`
      );
    } else {
      status = "MAYBE";
      reasonsEn.push(
        "Applicable for family members aged 0 to 18 years in Uttar Pradesh."
      );
      reasonsHi.push("उत्तर प्रदेश के 0 से 18 वर्ष आयु वर्ग के बच्चों हेतु मान्य।");
    }
  }

  // Fallback
  else {
    status = "ELIGIBLE";
    reasonsEn.push("Universal public health program available across Uttar Pradesh.");
    reasonsHi.push("उत्तर प्रदेश भर में उपलब्ध सार्वभौमिक जन स्वास्थ्य कार्यक्रम।");
  }

  return {
    id: scheme.id,
    name: scheme.name,
    nameHi: meta.nameHi,
    description: scheme.description,
    descriptionHi: meta.descriptionHi,
    status,
    reasons: reasonsEn,
    reasonsHi,
    benefitText: scheme.benefitText,
    benefitTextHi: meta.benefitTextHi,
    howToApply: scheme.howToApply,
    howToApplyHi: meta.howToApplyHi,
    documentsNeeded: meta.documentsNeeded,
    documentsNeededHi: meta.documentsNeededHi,
    officialUrl: scheme.officialUrl || "https://uphealth.up.nic.in",
    categoryBucket: meta.categoryBucket,
    indicativeCoverage: meta.indicativeCoverage,
  };
}

/**
 * Evaluates all schemes and sorts by eligibility priority:
 * 1. ELIGIBLE first
 * 2. MAYBE second
 * 3. NOT_ELIGIBLE last
 */
export function evaluateAllSchemes(
  schemes: any[],
  profile: UserProfile,
  language: "en" | "hi" = "en"
): SchemeEvaluationResult[] {
  const evaluated = schemes.map((s) =>
    evaluateSchemeEligibility(s, profile, language)
  );

  const priorityOrder = {
    ELIGIBLE: 1,
    MAYBE: 2,
    NOT_ELIGIBLE: 3,
  };

  return evaluated.sort(
    (a, b) => priorityOrder[a.status] - priorityOrder[b.status]
  );
}

/**
 * Contextual scheme helper for search results and prescription pages:
 * Recommends relevant government programs based on searched medicine or prescription salts.
 */
export function getContextualSchemesForMedicine(params: {
  medicineName?: string;
  salts?: string[];
  isChronic?: boolean;
  userAge?: number | null;
}): Array<{
  id: string;
  schemeName: string;
  schemeNameHi: string;
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  badge: string;
  badgeHi: string;
  actionUrl: string;
}> {
  const { medicineName = "", salts = [], isChronic = false, userAge } = params;
  const nameLower = medicineName.toLowerCase();
  const saltsCombined = salts.join(" ").toLowerCase();

  const banners = [];

  // 1. Chronic disease (Diabetes, BP, Heart) -> NP-NCD & Jan Aushadhi
  const isDiabetesOrBP =
    isChronic ||
    saltsCombined.includes("metformin") ||
    saltsCombined.includes("telmisartan") ||
    saltsCombined.includes("amlodipine") ||
    saltsCombined.includes("atorvastatin") ||
    nameLower.includes("glycomet") ||
    nameLower.includes("telma") ||
    nameLower.includes("atorva");

  if (isDiabetesOrBP) {
    banners.push({
      id: "np-ncd-chronic",
      schemeName: "National Programme for Prevention & Control of NCDs",
      schemeNameHi: "राष्ट्रीय असंक्रामक रोग कार्यक्रम (NP-NCD)",
      title: "Free Monthly Chronic Medicine Entitlement",
      titleHi: "मुफ्त मासिक दवा सुविधा (डायबिटीज एवं बीपी)",
      subtitle:
        "You may be entitled to FREE monthly refills of this medicine at your nearest Ayushman Arogya Mandir / Sub-Centre.",
      subtitleHi:
        "नजदीकी आयुष्मान आरोग्य मंदिर पर यह दवा हर महीने 100% मुफ्त उपलब्ध हो सकती है।",
      badge: "Free Chronic Refill",
      badgeHi: "मुफ्त मासिक दवा",
      actionUrl: "/schemes?filter=CHRONIC",
    });
  }

  // 2. Maternal / Pregnancy vitamins (Iron, Calcium, Folic Acid)
  const isMaternalDrug =
    saltsCombined.includes("folic") ||
    saltsCombined.includes("iron") ||
    saltsCombined.includes("calcium") ||
    nameLower.includes("folvite") ||
    nameLower.includes("autrin");

  if (isMaternalDrug) {
    banners.push({
      id: "pmsma-maternal",
      schemeName: "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
      schemeNameHi: "प्रधानमंत्री सुरक्षित मातृत्व अभियान",
      title: "100% Free Antenatal Care on 9th of Every Month",
      titleHi: "हर महीने 9 तारीख को मुफ्त मातृत्व जांच व दवाएं",
      subtitle:
        "Pregnant mothers receive 100% free Iron, Folic Acid, Calcium, and ultrasounds across government health facilities.",
      subtitleHi:
        "गर्भवती माताओं को सरकारी अस्पतालों में आयरन, फोलिक एसिड व अल्ट्रासाउंड पूरी तरह मुफ्त दिए जाते हैं।",
      badge: "Maternal Health",
      badgeHi: "मातृत्व सुरक्षा",
      actionUrl: "/schemes?filter=MATERNAL",
    });
  }

  // 3. Super Senior 70+
  if (typeof userAge === "number" && userAge >= 70) {
    banners.push({
      id: "vay-vandana-70",
      schemeName: "Ayushman Vay Vandana Yojana (70+ Seniors)",
      schemeNameHi: "आयुष्मान वय वंदना (70+ वरिष्ठ नागरिक)",
      title: "Universal ₹5,00,000 Health Cover for Seniors 70+",
      titleHi: "70+ वरिष्ठ नागरिकों हेतु ₹5 लाख का मुफ्त स्वास्थ्य कवर",
      subtitle:
        "No income ceiling: Every citizen aged 70 and above in UP is eligible for free hospital and medicine coverage.",
      subtitleHi:
        "बिना किसी आय सीमा के: 70 वर्ष से अधिक उम्र के सभी वरिष्ठ नागरिक ₹5 लाख के मुफ्त कवर के पात्र हैं।",
      badge: "70+ Senior Cover",
      badgeHi: "70+ बुजुर्ग कवर",
      actionUrl: "/schemes?filter=SENIOR",
    });
  }

  // 4. Default: Jan Aushadhi & UP Free Hospital Drugs
  if (banners.length === 0) {
    banners.push({
      id: "janaushadhi-generic",
      schemeName: "Pradhan Mantri Jan Aushadhi Pariyojana",
      schemeNameHi: "प्रधानमंत्री जन औषधि परियोजना",
      title: "50% to 90% Savings at Jan Aushadhi Kendras",
      titleHi: "जन औषधि केंद्रों पर 50% से 90% तक की भारी बचत",
      subtitle:
        "Government-tested generic equivalent available at PM Jan Aushadhi Kendras in Lucknow.",
      subtitleHi:
        "लखनऊ के प्रमाणित जन औषधि केंद्रों से इसी साल्ट की गुणवत्तापूर्ण जेनेरिक दवा 70% तक सस्ती पाएं।",
      badge: "Jan Aushadhi Subsidized",
      badgeHi: "जन औषधि सब्सिडी",
      actionUrl: "/schemes",
    });
  }

  return banners;
}
