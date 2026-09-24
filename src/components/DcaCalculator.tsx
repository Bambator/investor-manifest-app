import React, { useState, useEffect } from "react";
import { DcaState } from "../types";
import { CalendarClock, CheckCircle, ArrowUpRight, TrendingUp, HelpCircle, AlertCircle } from "lucide-react";

interface DcaCalculatorProps {
  onCalculate: (hasWon: boolean) => void;
  isCompleted: boolean;
}

export default function DcaCalculator({ onCalculate, isCompleted }: DcaCalculatorProps) {
  const [dca, setDca] = useState<DcaState>({
    asset: "BTC",
    monthlyAmount: 100, // USD
    years: 3,
    growthRate: 35, // % annual growth
  });

  const [frequency, setFrequency] = useState<"weekly" | "monthly">("monthly");
  const [results, setResults] = useState<{
    totalInvested: number;
    finalValue: number;
    totalProfit: number;
    roi: number;
    comparisonLumpSum: number;
  } | null>(null);

  const calculateDca = () => {
    const totalMonths = dca.years * 12;
    const ratePerPeriod = (dca.growthRate / 100) / (frequency === "weekly" ? 52 : 12);
    const investmentPerPeriod = frequency === "weekly" ? dca.monthlyAmount / 4.33 : dca.monthlyAmount;
    const totalPeriods = frequency === "weekly" ? Math.round(dca.years * 52) : totalMonths;

    let finalValue = 0;
    let totalInvested = 0;

    // Simulate regular investing with compounding
    for (let i = 0; i < totalPeriods; i++) {
      totalInvested += investmentPerPeriod;
      // apply growth for the remaining time
      finalValue = (finalValue + investmentPerPeriod) * (1 + ratePerPeriod);
    }

    const totalProfit = Math.max(0, finalValue - totalInvested);
    const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    // Compare with Lump-sum (investing everything at day 1)
    // Formula: PV * (1 + r)^n
    const lumpSumTotal = totalInvested;
    const comparisonLumpSum = lumpSumTotal * Math.pow(1 + (dca.growthRate / 100), dca.years);

    setResults({
      totalInvested: Math.round(totalInvested),
      finalValue: Math.round(finalValue),
      totalProfit: Math.round(totalProfit),
      roi: Math.round(roi),
      comparisonLumpSum: Math.round(comparisonLumpSum),
    });

    if (typeof onCalculate === "function") {
      onCalculate(true);
    }
  };

  useEffect(() => {
    calculateDca();
  }, [dca.asset, dca.monthlyAmount, dca.years, dca.growthRate, frequency]);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6" id="dca-calculator-tool">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Симулятор накопления (DCA)</h4>
            <p className="text-xs text-slate-500">Почувствуй силу регулярных инвестиций на графике</p>
          </div>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Активно
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Controls */}
        <div className="space-y-4">
          <h5 className="font-semibold text-slate-700 text-sm border-b pb-1">Параметры DCA-плана</h5>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Выбери актив</label>
              <select
                value={dca.asset}
                onChange={(e) => setDca(prev => ({ ...prev, asset: e.target.value as "BTC" | "ETH" }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                <option value="BTC">BTC (Биткоин)</option>
                <option value="ETH">ETH (Эфириум)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Периодичность</label>
              <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setFrequency("weekly")}
                  className={`flex-1 text-center py-1 rounded text-xs font-bold transition-all ${
                    frequency === "weekly" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Неделя
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency("monthly")}
                  className={`flex-1 text-center py-1 rounded text-xs font-bold transition-all ${
                    frequency === "monthly" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Месяц
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Сумма покупки (в месяц, $)
            </label>
            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={dca.monthlyAmount}
              onChange={(e) => setDca(prev => ({ ...prev, monthlyAmount: Number(e.target.value) }))}
              className="w-full accent-emerald-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-700 font-bold mt-1">
              <span>$10</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">${dca.monthlyAmount} в месяц</span>
              <span>$2,000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Срок накопления</label>
              <select
                value={dca.years}
                onChange={(e) => setDca(prev => ({ ...prev, years: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={1}>1 год</option>
                <option value={2}>2 года</option>
                <option value={3}>3 года</option>
                <option value={5}>5 лет</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Рост в год (средний %)</label>
              <input
                type="number"
                value={dca.growthRate}
                min="5"
                max="300"
                onChange={(e) => setDca(prev => ({ ...prev, growthRate: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Display Results */}
        {results && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h5 className="font-semibold text-slate-800 text-sm border-b pb-2">Результаты DCA-стратегии</h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Инвестировано всего</span>
                  <span className="text-base font-bold text-slate-700">${results.totalInvested.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <span className="block text-[10px] text-emerald-600 uppercase font-bold">Финальный портфель</span>
                  <span className="text-base font-bold text-emerald-700 flex items-center gap-1">
                    ${results.finalValue.toLocaleString()}
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Чистая прибыль:</span>
                  <span className="font-bold text-slate-800">${results.totalProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Общая доходность (ROI):</span>
                  <span className="font-bold text-emerald-600">+{results.roi}%</span>
                </div>
              </div>

              {/* Visual growth bars */}
              <div className="space-y-2 border-t pt-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>СВОИ ВЛОЖЕНИЯ</span>
                    <span>${results.totalInvested.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full" style={{ width: "35%" }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-emerald-500">
                    <span>ИТОГ С НАКОПЛЕНИЕМ</span>
                    <span>${results.finalValue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Wisdom Box */}
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 leading-relaxed font-medium">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  <span className="font-bold">Почему DCA побеждает: </span>
                  Если бы ты инвестировал всю сумму сразу (Lump-Sum) на самом пике бычьего рынка, твоя просадка длилась бы годами. DCA позволяет тебе радоваться падению цен, ведь каждая новая покупка снижает твою среднюю точку входа. Дисциплина всегда бьет тайминг!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
