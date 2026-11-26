"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Search,
  Clock,
  MessageSquare,
  Receipt,
  Activity,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function DemoGuideTour() {
  const { language } = useTranslation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      stepNumber: 1,
      titleEn: "1. AI Prescription OCR & Digitization",
      titleHi: "1. डॉक्टर पर्चा AI स्कैन एवं डिजिटलीकरण",
      tagEn: "Gemini 2.0 Flash Vision",
      tagHi: "जेमिनी विजन AI",
      path: "/prescription",
      icon: FileText,
      color: "from-blue-600 to-indigo-700",
      descriptionEn:
        "Upload or photograph a handwritten doctor prescription. Gemini Vision OCR extracts brand names, active salts, strength, frequency, and provides Web Speech audio explanations in Hindi & English.",
      descriptionHi:
        "डॉक्टर के हस्तलिखित पर्चे का फोटो खींचें। Gemini Vision तुरंत दवा, साल्ट, खुराक और समय निकालकर रिव्यू टेबल बनाता है और हिंदी में बोलकर समझाता है।",
    },
    {
      stepNumber: 2,
      titleEn: "2. Deterministic Generic Substitution",
      titleHi: "2. सटीक जेनेरिक दवा प्रतिस्थापन",
      tagEn: "Exact Salt & Strength Matching",
      tagHi: "सटीक साल्ट व खुराक मिलान",
      path: "/search?q=Paracetamol",
      icon: Search,
      color: "from-emerald-600 to-teal-700",
      descriptionEn:
        "Matches identical active salts on fair price-per-unit, classifies certified PM Jan Aushadhi generic alternatives, and displays safety notices for narrow-therapeutic-index drugs (Thyroxine, Warfarin).",
      descriptionHi:
        "हूबहू वही साल्ट और खुराक वाली जन औषधि दवाएं खोजें जो 70%+ सस्ती हैं। नैरो थेराप्यूटिक इंडेक्स दवाओं पर सुरक्षा चेतावनी भी प्रदर्शित होती है।",
    },
    {
      stepNumber: 3,
      titleEn: "3. Zero-Prepayment 2-Hour Pickup Hold",
      titleHi: "3. बिना भुगतान 2 घंटे की काउंटर बुकिंग",
      tagEn: "Zero Waste • Stock Locked",
      tagHi: "स्टॉक लॉक • बिना अग्रिम भुगतान",
      path: "/orders",
      icon: Clock,
      color: "from-amber-600 to-orange-700",
      descriptionEn:
        "Reserve medicine at a nearby pharmacy with zero prepayment. A live 2-hour countdown timer temporarily reserves inventory at the chemist, preventing stockouts and wasted citizen travel.",
      descriptionHi:
        "दुकानदार के पास दवा का स्टॉक 2 घंटे के लिए सुरक्षित करें। लाइव उल्टी गिनती टाइमर और 4-चरणीय स्टेटस बार से पारदर्शिता सुनिश्चित होती है।",
    },
    {
      stepNumber: 4,
      titleEn: "4. Citizen-Pharmacist Real-Time Chat",
      titleHi: "4. नागरिक-फार्मासिस्ट सीधी चैट",
      tagEn: "3-Second Polling • Quick Chips",
      tagHi: "त्वरित रिप्लाई चिप्स",
      path: "/orders",
      icon: MessageSquare,
      color: "from-teal-600 to-cyan-700",
      descriptionEn:
        "Direct bilateral order communication between patient and shopkeeper with 3-second live polling and one-tap quick-reply chips ('Is the generic version available?', 'When will it be ready?').",
      descriptionHi:
        "दुकानदार से सीधे चैट करें। 'क्या जेनेरिक उपलब्ध है?', 'दवा कब तैयार होगी?' जैसे आसान बटनों से तुरंत बातचीत करें।",
    },
    {
      stepNumber: 5,
      titleEn: "5. Chemist Wholesale Invoice OCR",
      titleHi: "5. केमिस्ट थोक बिल OCR स्टॉक अपडेट",
      tagEn: "DPCO Price Ceiling Compliance",
      tagHi: "सरकारी मूल्य नियंत्रण नियम",
      path: "/shop/upload-bill",
      icon: Receipt,
      color: "from-purple-600 to-pink-700",
      descriptionEn:
        "Shopkeepers snap photos of wholesale purchase bills. OCR extracts batch numbers, expiry dates, and rates, flagging any selling prices that violate DPCO 2013 government ceiling price rules.",
      descriptionHi:
        "फार्मासिस्ट खरीद बिल की फोटो खींचकर सीधे स्टॉक अपडेट करता है। सरकारी सीलिंग मूल्य (DPCO) के उल्लंघन पर तुरंत चेतावनी मिलती है।",
    },
    {
      stepNumber: 6,
      titleEn: "6. UP Syndromic Surveillance Heatmap",
      titleHi: "6. यूपी स्वास्थ्य विभाग महामारी हीटमैप",
      tagEn: "IDSP Early Warning Signals",
      tagHi: "प्रारंभिक बीमारी चेतावनी",
      path: "/admin/heatmap",
      icon: Activity,
      color: "from-rose-600 to-red-800",
      descriptionEn:
        "Early warning detection from over-the-counter medicine searches. Lights up fever surges in Chowk and Alambagh, and allows administrators to broadcast buffer stock advisories to nearby chemists.",
      descriptionHi:
        "नागरिकों की खोज के आधार पर बुखार के प्रकोप का प्रारंभिक पता लगाएं (चौक और आलमबाग में अलर्ट)। एक क्लिक में स्थानीय मेडिकल स्टोरों को सलाह जारी करें।",
    },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleGoToFlow = () => {
    router.push(current.path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Demo Guide Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Hackathon Demo Walkthrough Guide"
        className="fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl border-2 border-emerald-400 flex items-center gap-2.5 text-xs font-black transition-all hover:scale-105 group"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>{language === "hi" ? "🎓 डेमो गाइड" : "🎓 Demo Guide"}</span>
        <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
          {currentStep + 1}/6
        </span>
      </button>

      {/* Demo Walkthrough Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Demo Guide"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Kaushal 24h Build Demo Walkthrough</span>
              </div>
              <h2
                id="demo-guide-title"
                className="text-xl sm:text-2xl font-black text-slate-900"
              >
                {language === "hi"
                  ? "हैकथॉन लाइव डेमो वॉकथ्रू"
                  : "Hackathon Live Demo Tour"}
              </h2>
              <p className="text-xs text-slate-500">
                {language === "hi"
                  ? "दवा सेतु के 6 मुख्य एंड-टू-एंड फ्लो देखें और सीधे संबंधित स्क्रीन पर जाएं।"
                  : "Walk through the 6 end-to-end features built for the 24-hour hackathon."}
              </p>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center gap-1.5 pt-1">
              {steps.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? "bg-emerald-600"
                      : idx < currentStep
                      ? "bg-emerald-200"
                      : "bg-slate-200"
                  }`}
                  title={`Step ${idx + 1}: ${st.titleEn}`}
                />
              ))}
            </div>

            {/* Current Step Card */}
            <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${current.color} text-white flex items-center justify-center shadow-xs`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === "hi"
                        ? `चरण ${currentStep + 1} / 6`
                        : `Flow ${currentStep + 1} of 6`}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {language === "hi" ? current.titleHi : current.titleEn}
                    </h3>
                  </div>
                </div>

                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 shadow-2xs">
                  {language === "hi" ? current.tagHi : current.tagEn}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {language === "hi" ? current.descriptionHi : current.descriptionEn}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "पिछला" : "Prev"}</span>
                </button>

                <button
                  type="button"
                  disabled={currentStep === steps.length - 1}
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
                  }
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <span>{language === "hi" ? "अगला" : "Next"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoToFlow}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{language === "hi" ? "इस स्क्रीन पर जाएं" : "Go to this screen"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
