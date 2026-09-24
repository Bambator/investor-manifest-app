import React, { useState, useEffect } from "react";
import { BudgetState } from "../types";
import { Shield, Sparkles, TrendingDown, HelpCircle, CheckCircle, RotateCcw } from "lucide-react";

interface BudgetPlannerProps {
  onCalculate: (hasWon: boolean) => void;
  isCompleted: boolean;
}

export default function BudgetPlanner({ onCalculate, isCompleted }: BudgetPlannerProps) {
  const [budget, setBudget] = useState<BudgetState>({
    monthlyIncome: 80000,
    rent: 25000,
    groceries: 15000,
    entertainment: 10000,
    debtPayment: 5000,
    otherExpenses: 10000,
    emergencyFundGoalMonths: 6,
    currentEmergencySavings: 20000,
  });

  const [results, setResults] = useState<{
    totalExpenses: number;
    surplus: number;
    neededEmergency: number;
    shortfall: number;
    monthsToGoal: number;
  } | null>(null);

  const calculateBudget = () => {
    const totalExpenses = budget.rent + budget.groceries + budget.entertainment + budget.debtPayment + budget.otherExpenses;
    const surplus = budget.monthlyIncome - totalExpenses;
    const essentialExpenses = budget.rent + budget.groceries + budget.debtPayment + budget.otherExpenses;
    const neededEmergency = totalExpenses * budget.emergencyFundGoalMonths;
    const shortfall = Math.max(0, neededEmergency - budget.currentEmergencySavings);
    
    // Calculate months to reach emergency goal
    let monthsToGoal = 0;
    if (shortfall > 0 && surplus > 0) {
      // assume user saves 50% of surplus towards emergency fund
      const savingsPerMonth = surplus * 0.5;
      monthsToGoal = Number((shortfall / savingsPerMonth).toFixed(1));
    }

    setResults({
      totalExpenses,
      surplus,
      neededEmergency,
      shortfall,
      monthsToGoal,
    });

    if (typeof onCalculate === "function") {
      onCalculate(true);
    }
  };

  useEffect(() => {
    calculateBudget();
  }, [budget.monthlyIncome, budget.rent, budget.groceries, budget.entertainment, budget.debtPayment, budget.otherExpenses, budget.emergencyFundGoalMonths, budget.currentEmergencySavings]);

  const handleInputChange = (key: keyof BudgetState, value: number) => {
    setBudget(prev => ({
      ...prev,
      [key]: Math.max(0, value)
    }));
  };

  const getAdvice = () => {
    if (!results) return "";
    const debtRatio = (budget.debtPayment / budget.monthlyIncome) * 100;
    const savingsRatio = (results.surplus / budget.monthlyIncome) * 100;

    if (debtRatio > 30) {
      return "🚨 Квази-кризис: твои долги забирают больше 30% дохода! Направь все силы на метод снежного кома (гаси самый мелкий долг первым). Забудь про крипту, пока долги не упадут хотя бы ниже 10%.";
    }
    if (results.surplus < 0) {
      return "❌ Минусовый баланс! Ты тратишь больше, чем зарабатываешь. Срочно урежь графу 'Развлечения' или ищи подработку. Инвестировать сейчас — финансовое самоубийство.";
    }
    if (results.shortfall > 0) {
      return `🛡️ Неплохо, но щит не готов! Тебе нужно накопить еще ${results.shortfall.toLocaleString()} ₽ до полной безопасности. При текущем бюджете (если откладывать 50% свободных денег) это займет примерно ${results.monthsToGoal} мес. Держись, бро!`;
    }
    return "🔥 Броня крепка! Твоя подушка полностью укомплектована. Долги под контролем, баланс положительный. Ты готов переходить к следующему шагу и инвестировать на классическом рынке!";
  };

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6" id="budget-planner-tool">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Калькулятор финансового щита</h4>
            <p className="text-xs text-slate-500">Сбалансируй бюджет и рассчитай подушку</p>
          </div>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Активно
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h5 className="font-semibold text-slate-700 text-sm border-b pb-1">Твои финансы (в месяц)</h5>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ежемесячный доход (₽)</label>
            <input
              type="number"
              value={budget.monthlyIncome || ""}
              onChange={(e) => handleInputChange("monthlyIncome", Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Аренда / ЖКХ (₽)</label>
              <input
                type="number"
                value={budget.rent || ""}
                onChange={(e) => handleInputChange("rent", Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Продукты (₽)</label>
              <input
                type="number"
                value={budget.groceries || ""}
                onChange={(e) => handleInputChange("groceries", Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Кредиты / Долги (₽)</label>
              <input
                type="number"
                value={budget.debtPayment || ""}
                onChange={(e) => handleInputChange("debtPayment", Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-rose-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Развлечения (₽)</label>
              <input
                type="number"
                value={budget.entertainment || ""}
                onChange={(e) => handleInputChange("entertainment", Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Другие расходы (₽)</label>
            <input
              type="number"
              value={budget.otherExpenses || ""}
              onChange={(e) => handleInputChange("otherExpenses", Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <h5 className="font-semibold text-slate-700 text-sm border-b pb-1 pt-2">Цели безопасности</h5>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Размер подушки (мес.)</label>
              <select
                value={budget.emergencyFundGoalMonths}
                onChange={(e) => handleInputChange("emergencyFundGoalMonths", Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={3}>3 месяца</option>
                <option value={4}>4 месяца</option>
                <option value={6}>6 месяцев</option>
                <option value={9}>9 месяцев</option>
                <option value={12}>12 месяцев</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Уже накоплено (₽)</label>
              <input
                type="number"
                value={budget.currentEmergencySavings || ""}
                onChange={(e) => handleInputChange("currentEmergencySavings", Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Outputs & Advice */}
        {results && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h5 className="font-semibold text-slate-800 text-sm border-b pb-2">Результаты расчетов</h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Всего расходов</span>
                  <span className="text-base font-bold text-slate-700">{(results.totalExpenses).toLocaleString()} ₽</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Свободный остаток</span>
                  <span className={`text-base font-bold ${results.surplus >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {(results.surplus).toLocaleString()} ₽
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Целевая подушка:</span>
                  <span className="font-bold text-slate-800">{(results.neededEmergency).toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Уже есть:</span>
                  <span className="font-bold text-emerald-600">{(budget.currentEmergencySavings).toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 border-t pt-1.5">
                  <span>Осталось накопить:</span>
                  <span className={`font-bold ${results.shortfall > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {(results.shortfall).toLocaleString()} ₽
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>ПРОГРЕСС ПОДУШКИ</span>
                  <span>{results.neededEmergency > 0 ? Math.min(100, Math.round((budget.currentEmergencySavings / results.neededEmergency) * 100)) : 100}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${results.neededEmergency > 0 ? Math.min(100, (budget.currentEmergencySavings / results.neededEmergency) * 100) : 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Advice Box */}
            <div className="mt-4 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>{getAdvice()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
