import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, Achievement, UserProgress, LessonStep, ManifestoState } from "./types";
import { LESSONS, LESSON_CONTENTS, ACHIEVEMENTS } from "./data";
import BudgetPlanner from "./components/BudgetPlanner";
import PortfolioAllocation from "./components/PortfolioAllocation";
import SecurityQuiz from "./components/SecurityQuiz";
import DcaCalculator from "./components/DcaCalculator";
import ManifestoBuilder from "./components/ManifestoBuilder";
import { 
  ShieldCheck, 
  TrendingUp, 
  Lock, 
  CalendarClock, 
  FileSignature, 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  MessageSquare, 
  RefreshCw,
  HelpCircle,
  Clock,
  Unlock,
  Check,
  AlertCircle
} from "lucide-react";

export default function App() {
  // Load progress from localStorage on mount
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem("investor_completed_steps");
    return saved ? JSON.parse(saved) : [];
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem("investor_unlocked_achievements");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeStepSlug, setActiveStepSlug] = useState<string>("finance-foundation");
  const [activeTab, setActiveTab] = useState<"lesson" | "tool">("lesson");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("investor_chat_messages");
    if (saved) {
      // parse back dates
      const parsed = JSON.parse(saved);
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
    return [
      {
        id: "welcome",
        role: "model",
        text: "Приветствую, будущий инвестор! 👋 Я Знайка CryptoInDex — твой проводник в мире финансов и криптовалют. Я прошел полный путь от обычного новичка, совершавшего типичные ошибки, до опытного инвестора. На этом пути я набил сотни шишек.\n\nСегодня я делюсь этим опытом с тобой — без лишней воды и сложных терминов. Слева ты видишь 5 шагов нашей дорожной карты. Изучай материалы, пользуйся калькуляторами и симуляторами распределения активов, а здесь в чате задавай мне любые вопросы про финансы, биткоин, риск-менеджмент или психологию рынков. Сформируем устойчивое мышление инвестора вместе! 🚀",
        timestamp: new Date()
      }
    ];
  });
  
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("investor_completed_steps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem("investor_unlocked_achievements", JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  useEffect(() => {
    localStorage.setItem("investor_chat_messages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Handle achievement unlock helper
  const unlockAchievement = (id: string) => {
    setUnlockedAchievements(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });

    const achievementName = ACHIEVEMENTS.find(a => a.id === id)?.title || "Достижение";
    
    let customText = "";
    if (id === "shield-builder") {
      customText = `🎉 *Ура! Ты разблокировал достижение «${achievementName}»!* 🏆\nЭто серьезный шаг. Ты наглядно доказал (-а), что готов (-а) применять знания на практике. Так держать, продолжаем двигаться по шагам! Напиши, если хочешь обсудить этот раздел подробнее.`;
    } else if (id === "risk-navigator") {
      customText = `🎉 *Ура! Ты разблокировал достижение «${achievementName}»!* 🏆\nТы еще раз доказал (-а), что готов (-а) применять знания на практике. Двигаемся дальше!`;
    } else if (id === "cyber-guard") {
      customText = `🎉 *Ура! Ты разблокировал достижение «${achievementName}»!* 🏆\nТак держать! Продолжаем движение!`;
    } else if (id === "dca-master") {
      customText = `🎉 *Ура! Ты разблокировал достижение «${achievementName}»!* 🏆\nОтличный результат! Стратегия — твой ключ к успеху!`;
    } else if (id === "investor-pro") {
      customText = `🎉 *Ура! Ты разблокировал достижение «${achievementName}»!* 🏆\nТеперь ты готов (-а)!`;
    } else {
      customText = `🎉 *Ура! Ты разблокировал достижение «${achievementName}»!* 🏆\nТы наглядно доказал (-а), что готов (-а) применять знания на практике. Двигаемся дальше по шагам!`;
    }

    setChatMessages(chatPrev => {
      // Bulletproof deduplication by congrats-ID pattern check
      if (chatPrev.some(msg => msg && typeof msg.id === "string" && msg.id.startsWith(`congrats-${id}`))) {
        return chatPrev;
      }
      
      const congratsMessage: ChatMessage = {
        id: `congrats-${id}-${Date.now()}`,
        role: "model",
        text: customText,
        timestamp: new Date()
      };
      return [...chatPrev, congratsMessage];
    });
  };

  // Step Completion Handlers
  const handleCompleteStep = (slug: string) => {
    setCompletedSteps(prev => {
      if (prev.includes(slug)) return prev;
      return [...prev, slug];
    });
  };

  // Tool callback: Step 1 (Budget Planner) completed
  const handleBudgetCalculated = () => {
    handleCompleteStep("finance-foundation");
    unlockAchievement("shield-builder");
  };

  // Tool callback: Step 2 (Risk Profiler) completed
  const handleRiskCalculated = (score: number) => {
    handleCompleteStep("market-basics");
    unlockAchievement("risk-navigator");
  };

  // Tool callback: Step 3 (Security Quiz) completed
  const handleSecurityCompleted = (score: number) => {
    handleCompleteStep("crypto-immersion");
    if (score === 4) {
      unlockAchievement("cyber-guard");
    }
  };

  // Tool callback: Step 4 (DCA Simulator) completed
  const handleDcaCalculated = () => {
    handleCompleteStep("dca-altcoins");
    unlockAchievement("dca-master");
  };

  // Tool callback: Step 5 (Manifesto Builder) completed
  const handleManifestoCompleted = (manifesto: ManifestoState) => {
    handleCompleteStep("manifesto");
    unlockAchievement("investor-pro");
  };

  // Reset progress helper
  const executeReset = () => {
    setCompletedSteps([]);
    setUnlockedAchievements([]);
    setChatMessages([
      {
        id: "welcome",
        role: "model",
        text: "Прогресс сброшен! Начинаем путь с чистого листа. Слева твоя дорожная карта, справа я — твой наставник Знайка CryptoInDex. Жду твоих вопросов! 🤜🤛",
        timestamp: new Date()
      }
    ]);
    setActiveStepSlug("finance-foundation");
    setActiveTab("lesson");
    setShowResetConfirm(false);
  };

  const handleResetAllProgress = () => {
    setShowResetConfirm(true);
  };

  // Send message to Express API
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const textToSend = typeof customText === "string" ? customText : chatInput;
    if (!textToSend || !textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    if (!customText) setChatInput("");
    setIsTyping(true);

    try {
      // Map ChatMessage format to server history format
      // filter out the last welcome message to prevent duplicates and keep payload tidy
      const historyPayload = chatMessages
        .slice(-8) // only send last 8 messages for context to optimize speed
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload
        })
      });

      const data = await res.json();
      
      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        text: data.text || "Извини, друг, что-то пошло не так в моей цепочке мыслей. Спроси еще раз!",
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "model",
        text: "🚨 Ошибка связи с сервером. Пожалуйста, убедись, что сервер работает корректно и API-ключ установлен в панели Secrets.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const activeStep = LESSONS.find(s => s.slug === activeStepSlug) || LESSONS[0];
  const activeContent = LESSON_CONTENTS[activeStepSlug];

  // Quick Chat suggestions
  const SUGGESTIONS = [
    { text: "Что такое газ (gas fee) в блокчейне?", label: "Что такое газ?" },
    { text: "Как правильно выбрать холодный кошелек?", label: "Выбор кошелька" },
    { text: "Что делать, если рынок сильно падает?", label: "Паника на рынке" },
    { text: "Объясни простыми словами разницу между BTC и альтами.", label: "BTC vs Альткоины" },
  ];

  // Calculate overall progress percentage
  const validCompletedSteps = Array.from(new Set(completedSteps)).filter(slug => LESSONS.some(l => l.slug === slug));
  const progressPercent = Math.min(100, Math.round((validCompletedSteps.length / LESSONS.length) * 100));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased" id="investor-genesis-app">
      {/* Upper Navigation & Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md select-none transform rotate-3">
              G
            </div>
            <div>
              <h1 className="font-serif text-xl font-extrabold text-slate-900 tracking-tight leading-none">Путь Инвестора: Интерактивная Дорожная карта</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Интерактивный крипто-роадмап от Знайки CryptoInDex</p>
            </div>
          </div>

          {/* Progress & Achievements Showcase */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto justify-end">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">ПРОГРЕСС</span>
                <span className="text-xs font-bold text-slate-800">{progressPercent}% ({validCompletedSteps.length}/{LESSONS.length})</span>
              </div>
              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Visual Achievement Medals */}
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div 
                    key={ach.id}
                    title={`${ach.title}: ${ach.description} (${isUnlocked ? "Разблокировано" : "Заблокировано"})`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isUnlocked 
                        ? "bg-emerald-100 border-2 border-emerald-500 text-emerald-700 shadow-sm" 
                        : "bg-slate-50 border border-slate-200 text-slate-300"
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                );
              })}
            </div>

            {/* Reset Button */}
            {showResetConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-lg p-1 animate-fadeIn">
                <span className="text-[10px] font-bold text-rose-700 px-1">Сбросить?</span>
                <button
                  onClick={executeReset}
                  className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 transition-colors"
                >
                  Да
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-300 transition-colors"
                >
                  Нет
                </button>
              </div>
            ) : (
              <button
                onClick={handleResetAllProgress}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                title="Сбросить весь прогресс"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace: Left Column (Book/Tool) & Right Column (AI Chat) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
        
        {/* LEFT COLUMN: Lesson List + Reader / Interactive Tools (8 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto">
          
          {/* 5-Step Horizontal Timeline Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex overflow-x-auto gap-2 no-scrollbar shadow-sm scroll-smooth">
            {LESSONS.map((lesson, idx) => {
              const isCompleted = completedSteps.includes(lesson.slug);
              const isActive = lesson.slug === activeStepSlug;
              
              return (
                <button
                  key={lesson.slug}
                  onClick={() => {
                    setActiveStepSlug(lesson.slug);
                    setActiveTab("lesson");
                  }}
                  className={`flex-1 min-w-[140px] text-left p-2.5 rounded-xl border transition-all relative ${
                    isActive 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-md transform -translate-y-0.5" 
                      : isCompleted
                        ? "bg-emerald-50/50 border-emerald-100 text-emerald-950 hover:bg-emerald-50"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                      ШАГ 0{idx + 1}
                    </span>
                    {isCompleted ? (
                      <CheckCircle className={`w-3.5 h-3.5 ${isActive ? "text-emerald-200" : "text-emerald-600"}`} />
                    ) : (
                      <Circle className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-300"}`} />
                    )}
                  </div>
                  <h3 className="text-xs font-extrabold truncate leading-tight">
                    {lesson.title.split(". ")[1]}
                  </h3>
                  <span className={`text-[9px] block mt-1 font-medium ${isActive ? "text-emerald-200" : "text-slate-400"}`}>
                    📖 {lesson.duration} чтения
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Reader Frame */}
          <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col shadow-sm overflow-hidden min-h-[500px]">
            {/* Header / Tab Selector */}
            <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-800 leading-tight">{activeStep.title}</h2>
                <p className="text-xs text-slate-500">{activeStep.subtitle}</p>
              </div>

              {/* Lesson vs Tool switcher */}
              <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 self-stretch sm:self-auto shrink-0">
                <button
                  onClick={() => setActiveTab("lesson")}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "lesson" ? "bg-white text-emerald-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Теория
                </button>
                <button
                  onClick={() => setActiveTab("tool")}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "tool" ? "bg-white text-emerald-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Симулятор
                </button>
              </div>
            </div>

            {/* Inner Content Area */}
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === "lesson" ? (
                /* Theory View */
                <div className="space-y-6">
                  {/* Intro Quote */}
                  <div className="p-4 bg-emerald-50/30 border-l-4 border-emerald-600 text-slate-700 text-xs italic leading-relaxed font-medium">
                    "{activeContent.intro}"
                  </div>

                  {/* Story Section */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Истории из практики Знайки CryptoInDex:</span>
                    <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l border-slate-200">
                      {activeContent.story}
                    </p>
                  </div>

                  {/* Detailed points */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Важнейшие правила шага:</span>
                    <ul className="space-y-2.5">
                      {activeContent.bullets.map((bullet, i) => (
                        <li key={i} className="text-xs text-slate-700 leading-relaxed font-medium pl-4 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Golden Rule / Summary */}
                  <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl">
                    <p className="text-xs text-amber-900 font-bold leading-relaxed">
                      💡 {activeContent.goldenRule}
                    </p>
                  </div>

                  {/* Call to action */}
                  <div className="border-t pt-5 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Освоил теорию? Проверь себя в интерактивном симуляторе этого шага!
                    </div>
                    <button
                      onClick={() => setActiveTab("tool")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
                    >
                      Открыть Симулятор <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Tool View */
                <div className="space-y-4">
                  {activeStepSlug === "finance-foundation" && (
                    <BudgetPlanner 
                      onCalculate={handleBudgetCalculated} 
                      isCompleted={completedSteps.includes("finance-foundation")}
                    />
                  )}
                  
                  {activeStepSlug === "market-basics" && (
                    <PortfolioAllocation 
                      onCalculate={handleRiskCalculated} 
                      isCompleted={completedSteps.includes("market-basics")}
                    />
                  )}

                  {activeStepSlug === "crypto-immersion" && (
                    <SecurityQuiz 
                      onComplete={handleSecurityCompleted} 
                      isCompleted={completedSteps.includes("crypto-immersion")}
                    />
                  )}

                  {activeStepSlug === "dca-altcoins" && (
                    <DcaCalculator 
                      onCalculate={handleDcaCalculated} 
                      isCompleted={completedSteps.includes("dca-altcoins")}
                    />
                  )}

                  {activeStepSlug === "manifesto" && (
                    <ManifestoBuilder 
                      onComplete={handleManifestoCompleted} 
                      isCompleted={completedSteps.includes("manifesto")}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Mentor Chat Interface (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Chat Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center font-serif font-black text-white text-lg shadow-sm">
                  З
                </div>
                {/* Active Indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 leading-tight">Наставник Знайка CryptoInDex</h3>
                <span className="text-[10px] text-slate-400 font-medium">Эксперт сообщества CryptoInDex (в сети)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md">
              <MessageSquare className="w-3.5 h-3.5" /> Чат-сессия
            </div>
          </div>

          {/* Chat History Panel */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 max-h-[550px] min-h-[350px]">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                    isUser 
                      ? "bg-emerald-600 text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-none font-medium whitespace-pre-wrap"
                  }`}>
                    {/* Render raw bold formats lightly */}
                    {(typeof msg.text === "string" ? msg.text : String(msg.text || "")).split("\n").map((line, idx) => {
                      // Process basic markdown bold strings manually
                      let parts: React.ReactNode[] = [];
                      let lastIdx = 0;
                      const boldRegex = /\*([^*]+)\*/g;
                      let match;

                      while ((match = boldRegex.exec(line)) !== null) {
                        if (match.index > lastIdx) {
                          parts.push(line.substring(lastIdx, match.index));
                        }
                        parts.push(<strong key={match.index} className="font-bold text-slate-900">{match[1]}</strong>);
                        lastIdx = boldRegex.lastIndex;
                      }
                      
                      if (lastIdx < line.length) {
                        parts.push(line.substring(lastIdx));
                      }

                      return (
                        <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
                          {parts.length > 0 ? parts : line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions scroll */}
          <div className="px-3 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar bg-white shrink-0">
            {SUGGESTIONS.map((suggest, idx) => (
              <button
                key={idx}
                disabled={isTyping}
                onClick={() => handleSendMessage(undefined, suggest.text)}
                className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded-full text-[10px] font-bold text-slate-500 transition-all border border-slate-200/50 hover:border-emerald-200"
              >
                {suggest.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
            <input
              type="text"
              value={chatInput}
              disabled={isTyping}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Спроси Знайку про крипту, стейкинг, DCA..."
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                !chatInput.trim() || isTyping
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>

      {/* Footer credits and resources */}
      <footer className="bg-slate-900 text-slate-400 text-center py-4 border-t border-slate-800 shrink-0 text-xs font-medium">
        <p>© {new Date().getFullYear()} Путь Инвестора: Интерактивная Дорожная карта. Разработано совместно с Криптоклубом 'CryptoInDex' и наставником Знайкой. Будьте разумны со своими финансами!</p>
        <p className="text-[10px] text-slate-600 mt-1">Отказ от ответственности: инвестиции связаны с риском. Не является индивидуальной инвестиционной рекомендацией.</p>
      </footer>
    </div>
  );
}
