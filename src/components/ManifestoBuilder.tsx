import React, { useState } from "react";
import { ManifestoState } from "../types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { 
  FileSignature, 
  CheckCircle, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  BookOpen,
  CheckSquare,
  Square,
  Users,
  ArrowUpRight
} from "lucide-react";

interface ManifestoBuilderProps {
  onComplete: (manifesto: ManifestoState) => void;
  isCompleted: boolean;
}

const ADDITIONAL_RULES = [
  {
    id: "dyor",
    title: "3. Клятва DYOR (Do Your Own Research)",
    short: "Не брать советы блогеров на веру, всегда изучать проект самостоятельно.",
    text: "«Я обязуюсь никогда не покупать монету только потому, что её посоветовал инфлюенсер, блогер или друг. Каждая покупка совершается только после моего личного изучения проекта (кто создатели, какую задачу решает, какая токеномика)»."
  },
  {
    id: "ludomania",
    title: "4. Лимит на «Лудоманию» (Мемкоины и щиткоины)",
    short: "Строго не более 1-3% капитала на высокорисковые спекуляции и быстрый забор тела.",
    text: "«На высокорисковые спекуляции (мемкоины, щиткоины) я выделяю строго не более 1-3% от крипто-капитала. Я мысленно прощаюсь с этими деньгами в момент покупки. Если монета делает 3-5х, я мгновенно забираю тело инвестиции»."
  },
  {
    id: "cold-storage",
    title: "5. Закон Холодного Хранения",
    short: "Долгосрочный портфель — только на некастодиальный кошелек, seed-фраза в оффлайне.",
    text: "«Я обязуюсь не хранить свой долгосрочный инвестиционный портфель на централизованных биржах. Монеты для долгосрочного удержания (HODL) я вывожу на свой личный некастодиальный кошелек. Моя сид-фраза хранится строго в оффлайне»."
  },
  {
    id: "abyss-average",
    title: "6. Защита от «Усреднения в бездну»",
    short: "Никогда не усреднять падающие щиткоины, которые потеряли фундаментал.",
    text: "«Я никогда не буду усреднять падающий щиткоин без фундаментальной ценности. Если проект теряет технологическую актуальность или разработчики забросили работу, я фиксирую убыток, а не жду чуда годами»."
  },
  {
    id: "debt-wall",
    title: "7. Анти-Долговая Стена",
    short: "Инвестировать только свободные деньги, никаких кредитов или долгов.",
    text: "«Я инвестирую в криптоактивы только те деньги, потеря которых никак не изменит мой привычный образ жизни. Я никогда не буду брать кредиты, займы или использовать деньги из семейного бюджета, предназначенные для жизни»."
  },
  {
    id: "dca",
    title: "8. Анти-тревожное правило DCA",
    short: "Системные покупки равными долями вместо попыток угадать дно рынка.",
    text: "«Я признаю, что не умею и не буду пытаться угадывать идеальное дно рынка. Я инвестирую системно, равными долями по стратегии DCA раз в неделю/месяц, фокусируясь на долгосрочном горизонте планирования (от 3 лет)»."
  },
  {
    id: "stablecoin-buffer",
    title: "9. Правило Стейблкоинов (Финансовая подушка от CryptoInDex)",
    short: "Всегда держать 15-20% портфеля в USDT/USDC для выкупа сильных проливов.",
    text: "«Я обязуюсь всегда держать не менее 15-20% портфеля в надежных стейблкоинах (USDT/USDC). Эта сухая сберегательная часть нужна исключительно для выкупа сильных рыночных проливов, а не для спонтанных эмоциональных сделок»."
  },
  {
    id: "detox-24h",
    title: "10. Эмоциональный детокс (Правило 24 часов от CryptoInDex)",
    short: "Давать себе 24 часа на остывание эмоций перед любой сделкой на импульсе.",
    text: "«Я никогда не принимаю инвестиционные решения в состоянии эйфории или паники. Если я вижу резкое движение рынка или горячую новость, я даю себе 24 часа на остывание эмоций перед тем, как совершить сделку»."
  }
];

export default function ManifestoBuilder({ onComplete, isCompleted }: ManifestoBuilderProps) {
  const [form, setForm] = useState<ManifestoState>({
    fullName: "",
    primaryGoal: "Создание пассивного дохода для финансовой независимости",
    maxCryptoAllocation: 15,
    sellingStrategy: "При росте актива на 100% забираю тело инвестиции (50%), а остальное оставляю расти бесплатно",
    fomoPromise: "Не покупать монеты на пике хайпа (на зеленых свечах) и никогда не открывать сделки с плечом (фьючерсы).",
  });

  const [selectedRules, setSelectedRules] = useState<string[]>([
    "dyor",
    "ludomania",
    "cold-storage",
    "abyss-average",
    "debt-wall",
    "dca",
    "stablecoin-buffer",
    "detox-24h"
  ]);

  const [customGoalText, setCustomGoalText] = useState("");
  const [customStrategyText, setCustomStrategyText] = useState("");
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [isCustomStrategy, setIsCustomStrategy] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const [activeReason, setActiveReason] = useState<"hype" | "leverage" | null>(null);
  const [generatedManifesto, setGeneratedManifesto] = useState<ManifestoState & { rules: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [clubJoined, setClubJoined] = useState(false);

  const toggleRule = (id: string) => {
    if (selectedRules.includes(id)) {
      setSelectedRules(prev => prev.filter(r => r !== id));
    } else {
      setSelectedRules(prev => [...prev, id]);
    }
  };

  const handleDownloadPDF = async () => {
    const page1El = document.getElementById("manifesto-page-1");
    const page2El = document.getElementById("manifesto-page-2");
    if (!page1El || !page2El) return;
    
    setExportingPdf(true);
    setPdfError(false);
    setPdfSuccess(false);

    // Helper to temporarily sanitize oklch from all stylesheets (style tags and link tags)
    const restoredActions: (() => void)[] = [];
    try {
      // 1. Process style tags
      const styleElements = Array.from(document.querySelectorAll("style"));
      styleElements.forEach((styleEl) => {
        const text = styleEl.textContent || "";
        if (text.includes("oklch")) {
          restoredActions.push(() => {
            styleEl.textContent = text;
          });
          const sanitized = text.replace(/oklch\([^)]+\)/gi, "rgb(150, 150, 150)");
          styleEl.textContent = sanitized;
        }
      });

      // 2. Process link tags
      const linkElements = Array.from(document.querySelectorAll("link[rel='stylesheet']")) as HTMLLinkElement[];
      for (const linkEl of linkElements) {
        try {
          const href = linkEl.href;
          if (href && (href.startsWith(window.location.origin) || href.startsWith("/") || !href.includes("://"))) {
            const response = await fetch(href);
            if (response.ok) {
              const cssText = await response.text();
              if (cssText.includes("oklch")) {
                const sanitizedCss = cssText.replace(/oklch\([^)]+\)/gi, "rgb(150, 150, 150)");
                const tempStyle = document.createElement("style");
                tempStyle.setAttribute("data-temp-sanitized", "true");
                tempStyle.textContent = sanitizedCss;
                document.head.appendChild(tempStyle);
                
                const originalDisabled = linkEl.disabled;
                linkEl.disabled = true;
                
                restoredActions.push(() => {
                  tempStyle.remove();
                  linkEl.disabled = originalDisabled;
                });
              }
            }
          }
        } catch (e) {
          console.warn("Could not sanitize link stylesheet:", linkEl.href, e);
        }
      }
    } catch (sanitizeErr) {
      console.warn("Style sanitization failed, proceeding with fallback style adjustments:", sanitizeErr);
    }

    try {
      // ESM / CommonJS Interop for html2canvas
      const html2canvasFn = typeof html2canvas === "function" ? html2canvas : (html2canvas as any).default;
      if (typeof html2canvasFn !== "function") {
        throw new Error("html2canvas is not a function");
      }

      // Render Page 1
      const canvas1 = await html2canvasFn(page1El, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 750,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 750,
        onclone: (clonedDoc) => {
          // Align cloned page to top-left with zero margin to avoid blank space on the right
          const clonedPage1 = clonedDoc.getElementById("manifesto-page-1");
          if (clonedPage1) {
            clonedPage1.style.margin = "0";
            clonedPage1.style.width = "750px";
            clonedPage1.style.maxWidth = "750px";
            clonedPage1.style.boxSizing = "border-box";
          }

          // Double layer protection inside the cloned document:
          // Remove cross-origin stylesheets that might have modern oklch rules
          const links = Array.from(clonedDoc.querySelectorAll("link[rel='stylesheet']"));
          links.forEach((linkEl: any) => {
            try {
              const href = linkEl.href;
              if (href) {
                const isLocal = href.startsWith(window.location.origin) || href.startsWith("/") || !href.includes("://");
                if (!isLocal) {
                  linkEl.remove();
                }
              } else {
                linkEl.remove();
              }
            } catch (e) {
              linkEl.remove();
            }
          });

          // Sanitize style tags
          const styleEls = Array.from(clonedDoc.querySelectorAll("style"));
          styleEls.forEach((styleEl: any) => {
            try {
              const text = styleEl.textContent || "";
              if (/oklch/i.test(text)) {
                styleEl.textContent = text.replace(/oklch\([^)]+\)/gi, "rgb(150, 150, 150)");
              }
            } catch (e) {
              styleEl.remove();
            }
          });

          // Clean up any inline oklch styles on all elements
          const allEl = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < allEl.length; i++) {
            const el = allEl[i] as HTMLElement;
            if (el.style) {
              const cssText = el.style.cssText;
              if (cssText && /oklch/i.test(cssText)) {
                el.style.cssText = cssText.replace(/oklch\([^)]+\)/gi, "rgb(150, 150, 150)");
              }
            }
          }
        }
      });

      // Render Page 2
      const canvas2 = await html2canvasFn(page2El, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 750,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 750,
        onclone: (clonedDoc) => {
          // Align cloned page to top-left with zero margin to avoid blank space on the right
          const clonedPage2 = clonedDoc.getElementById("manifesto-page-2");
          if (clonedPage2) {
            clonedPage2.style.margin = "0";
            clonedPage2.style.width = "750px";
            clonedPage2.style.maxWidth = "750px";
            clonedPage2.style.boxSizing = "border-box";
          }

          const links = Array.from(clonedDoc.querySelectorAll("link[rel='stylesheet']"));
          links.forEach((linkEl: any) => {
            try {
              const href = linkEl.href;
              if (href) {
                const isLocal = href.startsWith(window.location.origin) || href.startsWith("/") || !href.includes("://");
                if (!isLocal) {
                  linkEl.remove();
                }
              } else {
                linkEl.remove();
              }
            } catch (e) {
              linkEl.remove();
            }
          });

          const styleEls = Array.from(clonedDoc.querySelectorAll("style"));
          styleEls.forEach((styleEl: any) => {
            try {
              const text = styleEl.textContent || "";
              if (/oklch/i.test(text)) {
                styleEl.textContent = text.replace(/oklch\([^)]+\)/gi, "rgb(150, 150, 150)");
              }
            } catch (e) {
              styleEl.remove();
            }
          });

          const allEl = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < allEl.length; i++) {
            const el = allEl[i] as HTMLElement;
            if (el.style) {
              const cssText = el.style.cssText;
              if (cssText && /oklch/i.test(cssText)) {
                el.style.cssText = cssText.replace(/oklch\([^)]+\)/gi, "rgb(150, 150, 150)");
              }
            }
          }
        }
      });
      
      // ESM / CommonJS Interop for jsPDF
      const jsPdfClass = typeof jsPDF === "function" ? jsPDF : (jsPDF as any).default;
      const pdf = new jsPdfClass({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pageMargin = 6;
      const maxPdfW = pdfWidth - pageMargin * 2;
      const maxPdfH = pdfHeight - pageMargin * 2;

      // Page 1
      const imgData1 = canvas1.toDataURL("image/jpeg", 0.95);
      let imgW = maxPdfW;
      let imgH1 = imgW * (canvas1.height / canvas1.width);
      if (imgH1 > maxPdfH) {
        imgH1 = maxPdfH;
        imgW = imgH1 * (canvas1.width / canvas1.height);
      }
      const x = (pdfWidth - imgW) / 2;
      const y1 = (pdfHeight - imgH1) / 2;
      pdf.addImage(imgData1, "JPEG", x, y1, imgW, imgH1);

      // Page 2 - use identical horizontal width and x offset as Page 1 for perfect margin alignment
      pdf.addPage();
      const imgData2 = canvas2.toDataURL("image/jpeg", 0.95);
      let imgH2 = imgW * (canvas2.height / canvas2.width);
      if (imgH2 > maxPdfH) {
        imgH2 = maxPdfH;
      }
      const y2 = (pdfHeight - imgH2) / 2;
      pdf.addImage(imgData2, "JPEG", x, y2, imgW, imgH2);
      
      const filename = `Инвестиционный_Манифест_${form.fullName.replace(/\s+/g, "_")}.pdf`;
      
      try {
        pdf.save(filename);
        setPdfSuccess(true);
      } catch (saveError) {
        console.warn("Direct pdf.save failed, trying blob URL download fallback:", saveError);
        const pdfBlob = pdf.output("blob");
        const blobUrl = URL.createObjectURL(pdfBlob);
        
        // Open the PDF in a new tab as fallback
        const newWindow = window.open(blobUrl, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          // If popup is blocked, create an explicit download link
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setPdfSuccess(true);
      }
    } catch (err) {
      console.error("PDF export error:", err);
      setPdfError(true);
    } finally {
      // Always restore original styles
      for (let i = restoredActions.length - 1; i >= 0; i--) {
        try {
          restoredActions[i]();
        } catch (restoreErr) {
          console.warn("Style restoration action failed:", restoreErr);
        }
      }
      setExportingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    
    const finalized = {
      ...form,
      rules: selectedRules
    };
    
    setGeneratedManifesto(finalized);
    if (typeof onComplete === "function") {
      onComplete(form);
    }
  };

  const handleCopy = () => {
    if (!generatedManifesto) return;

    const rulesText = ADDITIONAL_RULES
      .filter(rule => generatedManifesto.rules.includes(rule.id))
      .map(rule => `\n📌 ${rule.title}:\n${rule.text}`)
      .join("\n");

    const text = `
=========================================
      ИНВЕСТИЦИОННЫЙ МАНИФЕСТ ИНВЕСТОРА
=========================================
Я, ${generatedManifesto.fullName}, настоящим заявляю и фиксирую свои правила инвестирования:

🎯 МОЯ ГЛАВНАЯ ЦЕЛЬ:
${generatedManifesto.primaryGoal}

🔒 КРИПТО-ЛИМИТ (МАКСИМАЛЬНАЯ АЛЛОКАЦИЯ):
Доля криптовалют в моем портфеле не должна превышать ${generatedManifesto.maxCryptoAllocation}% от всех моих сбережений.

🚪 СТРАТЕГИЯ ФИКСАЦИИ ПРИБЫЛИ (ВЫХОДА):
${generatedManifesto.sellingStrategy}

🛡️ ДВА БАЗОВЫХ ЖИЗНЕННО ВАЖНЫХ ПРАВИЛА:

🟢 1. Не покупать на пике хайпа (на зеленых свечах)
- Ловушка синдрома FOMO (упущенной выгоды): Когда монета летит вверх и рисует огромные зеленые свечи, твой мозг кричит: «Быстрее, я упускаю миллионы!». Но реальность рынка жестока: крупные игроки (киты) всегда обналичивают свою прибыль об тех, кто покупает на хаях.
- Статистика против тебя: После любого вертикального роста всегда идет коррекция (откат цены назад). Покупая на пике, ты почти гарантированно мгновенно уходишь в минус. Начинается паника, ты продаешь в убыток, а актив после этого разворачивается и идет вверх.
- Как надо: Инвесторы покупают тогда, когда на рынке царит страх и «льется кровь» (красные свечи), а продают во время всеобщей эйфории (зеленые свечи).

🔴 2. Никогда не открывать сделки с плечом (фьючерсы)
- Крипта — это не казино: Торговля с плечом (когда ты берешь взаймы у биржи, чтобы увеличить сумму сделки) на волатильном крипторынке — это самый быстрый способ мгновенно обнулить твой депозит.
- Механика ликвидации: В крипте движение цены на 10-15% в день — это обычный вторник. Если у тебя открыта сделка с 10-м плечом (10х), то движение рынка всего на 10% против твоей позиции полностью уничтожает (ликвидирует) твой баланс до нуля.
- Спокойствие спота: На спотовом рынке (покупка реальных монет без плеч) ты полноценно владеешь активом. Даже если Биткоин упадет на 50%, у тебя останется то же количество монет BTC, и ты сможешь спокойно переждать бурю. На фьючерсах тебя просто сотрет с рынка навсегда.

=========================================
      ДОПОЛНИТЕЛЬНЫЕ НЕЗЫБЛЕМЫЕ ПРАВИЛА:
=========================================
${rulesText || "Дополнительные правила не выбраны."}

-----------------------------------------
Данный манифест составлен в здравом уме и твердой памяти. Он является законом для моих финансов в периоды бычьего хайпа и медвежьей паники.

Подпись инвестора: ${generatedManifesto.fullName}
Со-подпись наставника: Знайка CryptoInDex (Инвест-Наставник)
Дата: ${new Date().toLocaleDateString("ru-RU")}
=========================================
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6" id="manifesto-builder-tool">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Создание Инвест-Манифеста</h4>
            <p className="text-xs text-slate-500">Зафиксируй свои правила на бумаге, чтобы не слить депозит</p>
          </div>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Подписано
          </span>
        )}
      </div>

      {!generatedManifesto ? (
        /* Form View */
        <div className="space-y-6">
          
          {/* EDUCATIONAL EXPLANATIONS: "Почему это жизненно важно сделать?" */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Почему два базовых правила жизненно важны?</span>
            </div>

            <div className="space-y-3">
              {/* Accordion 1 */}
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveReason(activeReason === "hype" ? null : "hype")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/70 transition-colors text-left"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    🟢 <span className="underline">1. Не покупать на пике хайпа (на зеленых свечах)</span>
                  </span>
                  {activeReason === "hype" ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {activeReason === "hype" && (
                  <div className="p-4 bg-white text-xs text-slate-600 space-y-3 border-t border-slate-100 leading-relaxed">
                    <div>
                      <strong className="text-slate-800 font-semibold block mb-0.5">💭 Ловушка синдрома FOMO (упущенной выгоды):</strong>
                      Когда монета летит вверх и рисует огромные зеленые свечи, твой мозг кричит: <em>«Быстрее, я упускаю миллионы!»</em>. Но реальность рынка жестока: крупные игроки (киты) всегда обналичивают свою прибыль об тех, кто покупает на хаях.
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold block mb-0.5">📊 Статистика против тебя:</strong>
                      После любого вертикального роста всегда идет коррекция (откат цены назад). Покупая на пике, ты почти гарантированно мгновенно уходишь в минус. Начинается паника, ты продаешь в убыток, а актив после этого разворачивается и идет вверх. Знакомо?
                    </div>
                    <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg font-medium">
                      <strong className="block mb-0.5">💡 Как надо:</strong>
                      Инвесторы покупают тогда, когда на рынке царит страх и «льется кровь» (красные свечи), а продают во время всеобщей эйфории (зеленые свечи).
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2 */}
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveReason(activeReason === "leverage" ? null : "leverage")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/70 transition-colors text-left"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    🔴 <span className="underline">2. Никогда не открывать сделки с плечом (фьючерсы)</span>
                  </span>
                  {activeReason === "leverage" ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {activeReason === "leverage" && (
                  <div className="p-4 bg-white text-xs text-slate-600 space-y-3 border-t border-slate-100 leading-relaxed">
                    <div>
                      <strong className="text-slate-800 font-semibold block mb-0.5">🎰 Крипта — это не казино:</strong>
                      Торговля с плечом (когда ты берешь взаймы у биржи, чтобы увеличить сумму сделки) на волатильном крипторынке — это самый быстрый способ мгновенно обнулить твой депозит.
                    </div>
                    <div>
                      <strong className="text-slate-800 font-semibold block mb-0.5">⚡ Механика ликвидации:</strong>
                      В крипте движение цены на 10-15% в день — это обычный вторник. Если у тебя открыта сделка с 10-м плечом (10х), то движение рынка всего на 10% против твоей позиции полностью уничтожает (ликвидирует) твой баланс до нуля.
                    </div>
                    <div className="p-2.5 bg-amber-50 text-amber-900 rounded-lg font-medium">
                      <strong className="block mb-0.5">🛡️ Спокойствие спота:</strong>
                      На спотовом рынке (покупка реальных монет без плеч) ты полноценно владеешь активом. Даже если Биткоин упадет на 50%, у тебя останется то же количество монет.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Имя и Фамилия Инвестора</label>
              <input
                type="text"
                required
                placeholder="Иван Иванов"
                value={form.fullName}
                onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Твоя главная финансовая цель</label>
              <select
                value={isCustomGoal ? "custom" : form.primaryGoal}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setIsCustomGoal(true);
                    setForm(prev => ({ ...prev, primaryGoal: customGoalText || "Моя собственная финансовая цель" }));
                  } else {
                    setIsCustomGoal(false);
                    setForm(prev => ({ ...prev, primaryGoal: val }));
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
              >
                <option value="Создание пассивного дохода для финансовой независимости">Создание пассивного дохода для финансовой независимости</option>
                <option value="Досрочный выход на пенсию и свобода">Досрочный выход на пенсию и свобода</option>
                <option value="Покупка недвижимости за наличные">Покупка недвижимости за наличные</option>
                <option value="Формирование капитала для бизнеса">Формирование капитала для бизнеса</option>
                <option value="Семейный капитал и будущее детей">Семейный капитал и будущее детей</option>
                <option value="custom">Своя цель (вписать вручную)</option>
              </select>
              {isCustomGoal && (
                <input
                  type="text"
                  required
                  placeholder="Впиши свою финансовую цель..."
                  value={customGoalText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCustomGoalText(text);
                    setForm(prev => ({ ...prev, primaryGoal: text || "Моя собственная финансовая цель" }));
                  }}
                  className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Крипто-Лимит (доля крипты в портфеле): {form.maxCryptoAllocation}%
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={form.maxCryptoAllocation}
                onChange={(e) => setForm(prev => ({ ...prev, maxCryptoAllocation: Number(e.target.value) }))}
                className="w-full accent-emerald-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>5% (Безопасно)</span>
                <span className={form.maxCryptoAllocation > 30 ? "text-rose-600 font-extrabold" : "text-emerald-600 font-bold"}>
                  {form.maxCryptoAllocation > 30 ? "⚠️ Высокий риск!" : "✅ Умеренный лимит"}
                </span>
                <span>100% (Лудомания)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Стратегия фиксации прибыли (выхода)</label>
              <select
                value={isCustomStrategy ? "custom" : form.sellingStrategy}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setIsCustomStrategy(true);
                    setForm(prev => ({ ...prev, sellingStrategy: customStrategyText || "Моя собственная стратегия фиксации прибыли" }));
                  } else {
                    setIsCustomStrategy(false);
                    setForm(prev => ({ ...prev, sellingStrategy: val }));
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
              >
                <option value="Лесенкой по заранее намеченным уровням">Лесенкой по заранее намеченным уровням</option>
                <option value="Продаю по 10% от портфеля при достижении целей каждые несколько месяцев на бычьем рынке">Лесенкой по 10% на росте рынка до полной фиксации</option>
                <option value="Строгий холдинг без продаж минимум 5 лет, игнорируя любые локальные коррекции">Строгий HODL на 5 лет без фиксаций</option>
                <option value="Переливаю прибыль из волатильных альткоинов в Биткоин и стейблкоины при каждом импульсе">Перелив прибыли из альтов в BTC и стейблкоины</option>
                <option value="custom">Своя стратегия (вписать вручную)</option>
              </select>
              {isCustomStrategy && (
                <input
                  type="text"
                  required
                  placeholder="Впиши свою стратегию фиксации прибыли..."
                  value={customStrategyText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setCustomStrategyText(text);
                    setForm(prev => ({ ...prev, sellingStrategy: text || "Моя собственная стратегия фиксации прибыли" }));
                  }}
                  className="mt-2 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                />
              )}
            </div>

            {/* ADDITIONAL RULES TO ADD */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Включить дополнительные правила в Манифест</label>
              <div className="space-y-2.5">
                {ADDITIONAL_RULES.map((rule) => {
                  const isChecked = selectedRules.includes(rule.id);
                  return (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => toggleRule(rule.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isChecked 
                          ? "bg-emerald-50/40 border-emerald-200 text-slate-800" 
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4.5 h-4.5 text-emerald-600" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-slate-800">{rule.title}</span>
                        <span className="block text-[10px] text-slate-500 leading-snug">{rule.short}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <FileSignature className="w-4 h-4" /> Сгенерировать и подписать Манифест
              </button>
            </div>
          </form>

          {/* CryptoInDex Teaser Callout */}
          <div className="mt-5 p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">ОФИЦИАЛЬНОЕ СООБЩЕСТВО</span>
              <h5 className="text-xs font-bold text-white">Крипто-клуб CryptoInDex 🌐</h5>
              <p className="text-[10px] text-slate-400 leading-snug">
                Сообщество по интересам с опытными экспертами и единомышленниками, двигающихся к формированию устойчивого мышления инвестора и финансовой свободе!
              </p>
              {activeReason === ("teaser" as any) && (
                <div className="mt-2 p-2.5 bg-slate-800 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-300 animate-fadeIn font-medium">
                  🚀 Подпиши свой личный Манифест выше, чтобы получить официальное приглашение в сообщество от Знайки CryptoInDex!
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveReason(activeReason === ("teaser" as any) ? null : ("teaser" as any))}
              className="shrink-0 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5 self-end sm:self-auto"
            >
              {activeReason === ("teaser" as any) ? "Скрыть" : "Подробнее"} <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* Document View */
        <div className="space-y-4">
          {/* Two-Page Document Preview */}
          <div className="space-y-6">
            {/* Page 1 */}
            <div 
              id="manifesto-page-1" 
              className="bg-white border border-slate-200 rounded-xl p-7 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between"
              style={{ 
                backgroundColor: "#ffffff", 
                borderColor: "#e2e8f0", 
                color: "#1e293b",
                width: "800px",
                minHeight: "1000px",
                maxWidth: "100%",
                margin: "0 auto",
                boxSizing: "border-box"
              }}
            >
              {/* Decorative background logo */}
              <div 
                className="absolute right-6 top-6 text-slate-100 select-none pointer-events-none"
                style={{ color: "#f1f5f9", opacity: 0.8 }}
              >
                <FileSignature className="w-36 h-36 transform rotate-12" />
              </div>

              <div className="relative space-y-5 flex-1 flex flex-col justify-between" style={{ color: "#1e293b" }}>
                <div>
                  <div className="text-center space-y-1 border-b border-slate-200 pb-4 mb-4" style={{ borderBottomColor: "#cbd5e1" }}>
                    <span className="text-xs uppercase tracking-widest font-extrabold text-slate-500" style={{ color: "#64748b" }}>ОФИЦИАЛЬНЫЙ ДОГОВОР</span>
                    <h5 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase" style={{ color: "#020617" }}>Инвестиционный Манифест</h5>
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold" style={{ color: "#475569" }}>Свод незыблемых правил разумного инвестора</p>
                  </div>

                  <div className="space-y-4 text-sm sm:text-base">
                    <p className="leading-relaxed text-slate-800 text-sm sm:text-base" style={{ color: "#1e293b" }}>
                      Я, <span className="font-bold text-slate-950 font-serif px-2 py-0.5 bg-slate-100 rounded text-base sm:text-lg" style={{ color: "#090d16", backgroundColor: "#f1f5f9" }}>{generatedManifesto.fullName}</span>, настоящим заявляю и фиксирую свои железные правила инвестирования, созданные на «холодную голову», чтобы защитить мой капитал от собственных эмоций, FOMO и жадности.
                    </p>

                    <div className="space-y-3.5">
                      <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
                        <span className="block text-xs font-extrabold text-slate-600 tracking-wide uppercase mb-1" style={{ color: "#475569" }}>🎯 ГЛАВНАЯ ФИНАНСОВАЯ ЦЕЛЬ:</span>
                        <p className="font-bold text-slate-950 italic text-base sm:text-lg pl-3 border-l-2 border-slate-800 leading-relaxed" style={{ borderLeftColor: "#1e293b", color: "#0f172a" }}>
                          {generatedManifesto.primaryGoal}
                        </p>
                      </div>

                      <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
                        <span className="block text-xs font-extrabold text-slate-600 tracking-wide uppercase mb-1" style={{ color: "#475569" }}>🔒 МАКСИМАЛЬНЫЙ КРИПТО-ЛИМИТ:</span>
                        <p className="text-sm sm:text-base text-slate-800 leading-relaxed" style={{ color: "#1e293b" }}>
                          Лимит аллокации в криптовалюте строго ограничен <span className="font-extrabold text-slate-950 bg-slate-100 px-2 py-0.5 rounded text-base sm:text-lg" style={{ color: "#020617", backgroundColor: "#f1f5f9" }}>{generatedManifesto.maxCryptoAllocation}%</span> от всех моих сбережений. При выходе за рамки я обязуюсь делать ребалансировку.
                        </p>
                      </div>

                      <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
                        <span className="block text-xs font-extrabold text-slate-600 tracking-wide uppercase mb-1" style={{ color: "#475569" }}>🚪 СТРАТЕГИЯ ФИКСАЦИИ ПРИБЫЛИ (ВЫХОД):</span>
                        <p className="text-sm sm:text-base text-slate-800 font-medium italic leading-relaxed" style={{ color: "#1e293b" }}>
                          {generatedManifesto.sellingStrategy}
                        </p>
                      </div>

                      <div className="pt-1">
                        <div className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wider uppercase mb-2.5 text-center border-b border-slate-100 pb-1.5" style={{ color: "#0f172a", borderBottomColor: "#f1f5f9" }}>
                          🛡️ ДВА БАЗОВЫХ ЖИЗНЕННО ВАЖНЫХ ПРАВИЛА:
                        </div>
                        <div className="space-y-3">
                          <div className="p-3.5 sm:p-4 border border-slate-200 rounded-xl" style={{ borderColor: "#e2e8f0" }}>
                            <span className="block text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-1.5" style={{ color: "#020617" }}>
                              🟢 1. Не покупать на пике хайпа (на зеленых свечах)
                            </span>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed" style={{ color: "#475569" }}>
                              <strong>Ловушка FOMO:</strong> На параболическом росте крупные игроки (киты) обналичивают свою прибыль об новичков. После взлета всегда идет сильная коррекция. Покупая на пике, ты почти гарантированно мгновенно уходишь в минус.
                            </p>
                            <p className="text-xs sm:text-sm text-emerald-800 font-bold mt-1.5 pl-2.5 border-l-2 border-emerald-600 leading-relaxed" style={{ color: "#064e3b", borderLeftColor: "#059669" }}>
                              💡 Решение: Покупать во время страха на рынке (красные свечи) и фиксировать прибыль во время всеобщей эйфории (зеленые свечи).
                            </p>
                          </div>

                          <div className="p-3.5 sm:p-4 border border-slate-200 rounded-xl" style={{ borderColor: "#e2e8f0" }}>
                            <span className="block text-base sm:text-lg font-extrabold text-slate-950 flex items-center gap-1.5" style={{ color: "#020617" }}>
                              🔴 2. Никогда не открывать сделки с плечом (фьючерсы)
                            </span>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed" style={{ color: "#475569" }}>
                              <strong>Крипта — это не казино:</strong> Плечи на волатильном крипторынке мгновенно обнуляют депозиты. Изменение цены всего на 10% против сделки с плечом 10х полностью ликвидирует баланс до нуля.
                            </p>
                            <p className="text-xs sm:text-sm text-rose-800 font-bold mt-1.5 pl-2.5 border-l-2 border-rose-600 leading-relaxed" style={{ color: "#4c0519", borderLeftColor: "#e11d48" }}>
                              🛡️ Решение: Работать только на спотовом рынке. Владея реальными монетами без плеч, можно спокойно переждать любую бурю без риска ликвидации.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-4 text-xs sm:text-sm mt-4" style={{ borderTopColor: "#cbd5e1" }}>
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ color: "#94a3b8" }}>ПОДПИСЬ ИНВЕСТОРА</span>
                      <p className="font-serif text-base font-bold text-slate-900 italic pb-0.5" style={{ color: "#0f172a" }}>
                        {generatedManifesto.fullName}
                      </p>
                      <div className="h-[1px] bg-slate-300 w-48" style={{ backgroundColor: "#cbd5e1" }} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ color: "#94a3b8" }}>СО-ПОДПИСЬ НАСТАВНИКА</span>
                      <p className="font-serif text-base font-bold text-slate-900 italic pb-0.5 flex items-center gap-1" style={{ color: "#0f172a" }}>
                        Знайка CryptoInDex <Sparkles className="w-4 h-4 text-emerald-600" style={{ color: "#059669" }} />
                      </p>
                      <div className="h-[1px] bg-slate-300 w-48" style={{ backgroundColor: "#cbd5e1" }} />
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400 mt-2" style={{ color: "#94a3b8" }}>
                    Страница 1 из 2
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 */}
            <div 
              id="manifesto-page-2" 
              className="bg-white border border-slate-200 rounded-xl p-7 sm:p-8 shadow-md relative overflow-hidden flex flex-col justify-between"
              style={{ 
                backgroundColor: "#ffffff", 
                borderColor: "#e2e8f0", 
                color: "#1e293b",
                width: "800px",
                minHeight: "1000px",
                maxWidth: "100%",
                margin: "0 auto",
                boxSizing: "border-box"
              }}
            >
              {/* Decorative background logo */}
              <div 
                className="absolute right-6 top-6 text-slate-100 select-none pointer-events-none"
                style={{ color: "#f1f5f9", opacity: 0.8 }}
              >
                <FileSignature className="w-36 h-36 transform rotate-12" />
              </div>

              <div className="relative space-y-5 flex-1 flex flex-col justify-between" style={{ color: "#1e293b" }}>
                <div>
                  <div className="text-center space-y-1 border-b border-slate-200 pb-4 mb-4" style={{ borderBottomColor: "#cbd5e1" }}>
                    <span className="text-xs uppercase tracking-widest font-extrabold text-slate-500" style={{ color: "#64748b" }}>Инвестиционный Манифест</span>
                    <h5 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase" style={{ color: "#020617" }}>📋 ДОПОЛНИТЕЛЬНЫЕ НЕЗЫБЛЕМЫЕ ПРАВИЛА</h5>
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold" style={{ color: "#475569" }}>Принципы долгосрочной безопасности и дисциплины</p>
                  </div>

                  <div className="space-y-4 text-sm sm:text-base">
                    <div className="space-y-3">
                      {ADDITIONAL_RULES
                        .filter(r => generatedManifesto.rules.includes(r.id))
                        .map((rule) => (
                          <div key={rule.id} className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
                            <span className="block text-base sm:text-lg font-bold text-slate-950 mb-1" style={{ color: "#020617" }}>{rule.title}</span>
                            <p className="text-slate-700 italic mt-0.5 leading-relaxed text-sm sm:text-base" style={{ color: "#334155" }}>{rule.text}</p>
                          </div>
                        ))}
                      {ADDITIONAL_RULES.filter(r => generatedManifesto.rules.includes(r.id)).length === 0 && (
                        <div className="p-12 text-center text-slate-400 italic text-base">
                          Дополнительные правила не выбраны. Вы можете отредактировать манифест, чтобы добавить их.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-4 text-xs sm:text-sm mt-4" style={{ borderTopColor: "#cbd5e1" }}>
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ color: "#94a3b8" }}>ПОДПИСЬ ИНВЕСТОРА</span>
                      <p className="font-serif text-base font-bold text-slate-900 italic pb-0.5" style={{ color: "#0f172a" }}>
                        {generatedManifesto.fullName}
                      </p>
                      <div className="h-[1px] bg-slate-300 w-48" style={{ backgroundColor: "#cbd5e1" }} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ color: "#94a3b8" }}>СО-ПОДПИСЬ НАСТАВНИКА</span>
                      <p className="font-serif text-base font-bold text-slate-900 italic pb-0.5 flex items-center gap-1" style={{ color: "#0f172a" }}>
                        Знайка CryptoInDex <Sparkles className="w-4 h-4 text-emerald-600" style={{ color: "#059669" }} />
                      </p>
                      <div className="h-[1px] bg-slate-300 w-48" style={{ backgroundColor: "#cbd5e1" }} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 mt-2" style={{ color: "#94a3b8" }}>
                    <span>Зафиксировано на блокчейне Genesis: {new Date().toLocaleDateString("ru-RU")}</span>
                    <span>Страница 2 из 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all bg-white"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Скопировано!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Скопировать текст
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={exportingPdf}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:translate-y-0.5"
            >
              {exportingPdf ? "Генерация PDF..." : "Скачать PDF-версию"}
            </button>
            <button
              onClick={() => setGeneratedManifesto(null)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Редактировать манифест
            </button>
          </div>

          {/* PDF Download Helper Info / Error Banners */}
          <div className="space-y-2 mt-2">
            {pdfSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-[11px] leading-relaxed animate-fadeIn">
                🎉 <strong>Успешно!</strong> Ваш Инвестиционный Манифест сгенерирован в PDF-файл. Если автоматическое скачивание заблокировано вашим браузером, пожалуйста, скопируйте текст Манифеста кнопкой выше или откройте приложение в новой вкладке.
              </div>
            )}
            {pdfError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-[11px] leading-relaxed animate-fadeIn">
                ⚠️ <strong>Не удалось скачать PDF?</strong> Вероятно, ваш браузер блокирует скачивание файлов из защищенной песочницы фрейма (iframe). 
                Пожалуйста, нажмите кнопку <strong>«Скопировать текст»</strong> или откройте это приложение в <strong>новой вкладке</strong> (кнопка со стрелочкой ↗️ в верхнем правом углу экрана) и скачайте PDF там!
              </div>
            )}
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              *Примечание: Если скачивание файла блокируется вашим браузером во фрейме, откройте приложение в новой вкладке с помощью кнопки ↗️ в правом верхнем углу экрана для беспрепятственной загрузки.*
            </p>
          </div>

          {/* CryptoInDex Premium VIP Invitation Card */}
          <div className="mt-6 p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 relative overflow-hidden shadow-xl" id="crypto-club-invite-card">
            {/* Background ambient lighting effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                      Официальное приглашение
                    </span>
                  </div>
                  <h5 className="font-extrabold text-base text-white tracking-tight mt-0.5">Крипто-клуб CryptoInDex 🌐</h5>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Твой первый шаг сделан — Манифест инвестора официально подписан. Самое время присоединиться к сообществу единомышленников и опытных экспертов, чтобы закрепить эти незыблемые правила на практике!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/60">
                  <span className="block text-xs font-bold text-emerald-400 mb-1">🧑‍🤝‍🧑 Единомышленники</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Сильное окружение по интересам, которое не поддается панике при проливах рынка и не фомит на росте.</p>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/60">
                  <span className="block text-xs font-bold text-emerald-400 mb-1">🎓 Опытные эксперты</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Регулярные разборы токеномики (DYOR), глубокий анализ новых проектов и прямые сессии.</p>
                </div>
                <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800/60">
                  <span className="block text-xs font-bold text-emerald-400 mb-1">🛡️ Устойчивое мышление</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Практическое формирование мышления разумного инвестора и уверенное движение к финансовой свободе.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
                <p className="text-[10px] text-slate-400 max-w-xs text-center sm:text-left leading-normal">
                  Вместе с CryptoInDex твой путь к финансовой свободе будет осознанным, безопасным и системным.
                </p>
                {clubJoined ? (
                  <div className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
                    <Check className="w-4 h-4 text-emerald-400" /> Заявка отправлена! Добро пожаловать! 🎉
                  </div>
                ) : (
                  <a
                    href="https://investorpractic.getcourse.ru/cms/system/contact?custom"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setClubJoined(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all active:translate-y-0.5 flex items-center justify-center gap-1 shadow-md shadow-emerald-950/40 text-center"
                  >
                    Вступить в CryptoInDex <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
