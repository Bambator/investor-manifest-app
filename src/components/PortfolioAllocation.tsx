import React, { useState } from "react";
import { RISK_QUESTIONS, PORTFOLIO_TEMPLATES } from "../data";
import { PortfolioAsset } from "../types";
import { TrendingUp, CheckCircle, Brain, RefreshCw, AlertTriangle, HelpCircle } from "lucide-react";

interface PortfolioAllocationProps {
  onCalculate: (score: number) => void;
  isCompleted: boolean;
}

export default function PortfolioAllocation({ onCalculate, isCompleted }: PortfolioAllocationProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [calculatedProfile, setCalculatedProfile] = useState<"conservative" | "moderate" | "aggressive" | null>(null);
  
  // For manual sliders when customized
  const [customAssets, setCustomAssets] = useState<PortfolioAsset[]>([]);
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const qId = RISK_QUESTIONS[currentQuestionIndex].id;
    const newAnswers = { ...answers, [qId]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestionIndex < RISK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate profile
      // Simple logic: sum of indices. Max sum is 6, min is 0.
      // 0-2: conservative, 3-4: moderate, 5-6: aggressive
      let totalScore = 0;
      for (const key in newAnswers) {
        totalScore += (newAnswers[Number(key)] || 0);
      }
      let profile: "conservative" | "moderate" | "aggressive" = "moderate";
      
      if (totalScore <= 2) {
        profile = "conservative";
      } else if (totalScore >= 5) {
        profile = "aggressive";
      }

      setCalculatedProfile(profile);
      setCustomAssets(JSON.parse(JSON.stringify(PORTFOLIO_TEMPLATES[profile].assets)));
      if (typeof onCalculate === "function") {
        onCalculate(totalScore * 16.6); // scale to 100
      }
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setCalculatedProfile(null);
    setIsEditingCustom(false);
  };

  const handleSliderChange = (id: string, newVal: number) => {
    setIsEditingCustom(true);
    setCustomAssets(prev => {
      const targetIndex = prev.findIndex(a => a.id === id);
      if (targetIndex === -1) return prev;
      
      const copy = [...prev];
      const diff = newVal - copy[targetIndex].percentage;
      copy[targetIndex].percentage = newVal;

      // Redistribute diff across other assets proportionally to keep sum = 100
      const otherAssets = copy.filter((_, idx) => idx !== targetIndex);
      const otherSum = otherAssets.reduce((sum, a) => sum + a.percentage, 0);

      if (otherSum > 0) {
        otherAssets.forEach(asset => {
          const share = asset.percentage / otherSum;
          asset.percentage = Math.max(0, Math.round(asset.percentage - diff * share));
        });
      } else {
        // If other sum is 0, split evenly
        const splitAmount = diff / otherAssets.length;
        otherAssets.forEach(asset => {
          asset.percentage = Math.max(0, Math.round(asset.percentage - splitAmount));
        });
      }

      // Readjust sum to exactly 100 because of rounding errors
      const currentSum = copy.reduce((sum, a) => sum + a.percentage, 0);
      if (currentSum !== 100) {
        const error = 100 - currentSum;
        // find max asset to dump remainder
        let maxAssetIdx = 0;
        let maxVal = -1;
        copy.forEach((a, idx) => {
          if (a.percentage > maxVal) {
            maxVal = a.percentage;
            maxAssetIdx = idx;
          }
        });
        copy[maxAssetIdx].percentage = Math.max(0, copy[maxAssetIdx].percentage + error);
      }

      return copy;
    });
  };

  const currentQuestion = RISK_QUESTIONS[currentQuestionIndex];

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6" id="portfolio-allocation-tool">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Определение Риск-Профиля</h4>
            <p className="text-xs text-slate-500">Пройди тест и сформируй правильный портфель</p>
          </div>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Активно
          </span>
        )}
      </div>

      {!calculatedProfile ? (
        /* Quiz Window */
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400">
            <span>РИСК-ТЕСТ</span>
            <span>ВОПРОС {currentQuestionIndex + 1} ИЗ {RISK_QUESTIONS.length}</span>
          </div>

          <h5 className="font-bold text-slate-700 mb-4 text-sm leading-snug">
            {currentQuestion.question}
          </h5>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className="w-full text-left p-3.5 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl text-xs font-medium text-slate-600 transition-all duration-200"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="w-full bg-slate-100 h-1 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / RISK_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        /* Results Window */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel: Portfolio template */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500 uppercase">Твой профиль</span>
              <button 
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Сбросить
              </button>
            </div>

            <h5 className="font-bold text-slate-800 text-base">
              {PORTFOLIO_TEMPLATES[calculatedProfile].title}
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              {PORTFOLIO_TEMPLATES[calculatedProfile].desc}
            </p>

            {/* Visual Portfolio Bar */}
            <div className="space-y-3">
              <div className="h-5 w-full rounded-full overflow-hidden flex">
                {customAssets.map((asset) => (
                  <div
                    key={asset.id}
                    style={{ 
                      width: `${asset.percentage}%`,
                      backgroundColor: asset.color
                    }}
                    className="h-full transition-all duration-300 relative group"
                    title={`${asset.name}: ${asset.percentage}%`}
                  />
                ))}
              </div>

              {/* Legend with interactive sliders */}
              <div className="space-y-3 border-t pt-3">
                {customAssets.map((asset) => (
                  <div key={asset.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                        {asset.name}
                      </span>
                      <span className="font-bold text-slate-900">{asset.percentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={asset.percentage}
                      onChange={(e) => handleSliderChange(asset.id, Number(e.target.value))}
                      className="w-full accent-emerald-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Investor Psychology Insight */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h5 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-600" /> Совет от Знайки CryptoInDex по твоему портфелю
              </h5>
              
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Психологический барьер: </span>
                    {calculatedProfile === "conservative" && "Твой портфель защищен, но в долгосроке инфляция может обгонять твои купоны. Для безопасного старта оптимально выделить от 10% до 15% портфеля под консервативные криптоинструменты и стейблкоины."}
                    {calculatedProfile === "moderate" && "Это идеальная база. Ты держишь стержень в виде акций и облигаций, а умеренные 20-30% в криптоактивах дадут тебе отличный дополнительный рост без угрозы сну и ментальному здоровью."}
                    {calculatedProfile === "aggressive" && "Ты заряжен (-а) на максимальный рост, это круто. Но помни: выделение 40-50% под высоковолатильную крипту требует титановых нервов. Будь уверен (-а), что спокойно перенесешь просадку криптоактивов и не зафиксируешь убытки в панике."}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-2 pt-2">
                <p>
                  💡 <span className="font-semibold text-slate-700">Что такое Диверсификация?</span> Это распределение средств по разным корзинам. Нельзя инвестировать только в Биткоин или только в акции одной компании.
                </p>
                <p>
                  📉 Если один сектор падает (например, криптозима), другие активы (например, золото или облигации) держат твой портфель на плаву.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 leading-relaxed font-semibold">
              ✨ Твой риск-профиль определен. Ты научился балансировать доходность и риск. Шаг за шагом мы превращаем теорию в практику!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
