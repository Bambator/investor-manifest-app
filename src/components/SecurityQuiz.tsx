import React, { useState } from "react";
import { QUIZ_QUESTIONS } from "../data";
import { Lock, CheckCircle, XCircle, ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";

interface SecurityQuizProps {
  onComplete: (score: number) => void;
  isCompleted: boolean;
}

export default function SecurityQuiz({ onComplete, isCompleted }: SecurityQuizProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    const correctIdx = QUIZ_QUESTIONS[currentQuestionIdx].correctIndex;
    let isCorrect = selectedOption === correctIdx;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      setWrongAnswers(prev => [...prev, currentQuestionIdx]);
    }

    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
      if (typeof onComplete === "function") {
        onComplete(score);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setWrongAnswers([]);
  };

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIdx];
  const isPerfect = score === QUIZ_QUESTIONS.length;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6" id="security-quiz-tool">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Экзамен по Крипто-Безопасности</h4>
            <p className="text-xs text-slate-500">Проверь свои щиты перед выходом в Web3</p>
          </div>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Сдано {isPerfect ? "на отлично!" : ""}
          </span>
        )}
      </div>

      {!quizFinished ? (
        /* Question view */
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>ЭКЗАМЕН БЕЗОПАСНОСТИ</span>
            <span>ВОПРОС {currentQuestionIdx + 1} ИЗ {QUIZ_QUESTIONS.length}</span>
          </div>

          <h5 className="font-bold text-slate-800 text-sm leading-snug">
            {currentQuestion.question}
          </h5>

          <div className="space-y-2.5">
            {currentQuestion.options.map((option, idx) => {
              let btnClass = "border-slate-200 hover:border-emerald-500 hover:bg-slate-50";
              
              if (selectedOption === idx) {
                btnClass = "border-emerald-600 bg-emerald-50/10 ring-2 ring-emerald-500/20";
              }

              if (isAnswered) {
                const correctIdx = currentQuestion.correctIndex;
                if (idx === correctIdx) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium";
                } else if (selectedOption === idx) {
                  btnClass = "border-rose-300 bg-rose-50 text-rose-950 font-medium";
                } else {
                  btnClass = "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-3.5 border rounded-xl text-xs font-medium transition-all duration-200 flex items-start gap-2.5 ${btnClass}`}
                >
                  {isAnswered && idx === currentQuestion.correctIndex && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && selectedOption === idx && idx !== currentQuestion.correctIndex && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Объяснение Знайки CryptoInDex:
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            {!isAnswered ? (
              <button
                disabled={selectedOption === null}
                onClick={handleConfirmAnswer}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  selectedOption === null 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                }`}
              >
                Ответить
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                {currentQuestionIdx < QUIZ_QUESTIONS.length - 1 ? "Следующий вопрос" : "Посмотреть результаты"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Finished view */
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-slate-800 text-lg">Результаты экзамена</h5>
            <p className="text-xs text-slate-500">Ты ответил правильно на {score} из {QUIZ_QUESTIONS.length} вопросов</p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl border text-xs leading-relaxed font-medium">
            {isPerfect ? (
              <div className="bg-emerald-50 text-emerald-800 border-emerald-100 p-1.5 rounded-lg">
                🏆 <span className="font-bold">Идеально! </span>
                Ты — настоящий кибер-ниндзя! Твои кошельки под надежной охраной, ты распознаешь фишинг на подлете и умеешь беречь сид-фразы. Web3 безопасен для тебя!
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 border-amber-100 p-2.5 rounded-lg space-y-2 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Будь осторожен! </span>
                    У тебя были ошибки. В криптомире одна такая ошибка может стоить тебе всех денег. Пожалуйста, внимательно перечитай лекцию по безопасности и пройди тест заново, чтобы довести защиту до автоматизма.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-emerald-600 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Начать заново
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
