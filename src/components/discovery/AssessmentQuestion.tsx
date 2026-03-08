"use client";

import { useId, useState } from "react";

export type QuestionType = "text" | "buttons" | "multiselect" | "scale";

export interface AssessmentQuestionConfig {
  emoji: string;
  question: string;
  type: QuestionType;
  placeholder?: string;
  options?: string[];
  scaleEmojis?: string[];
}

interface AssessmentQuestionProps {
  question: AssessmentQuestionConfig;
  onAnswer: (answer: string | string[] | number) => void;
  progress: number;
  currentStep: number;
  totalSteps: number;
}

export function AssessmentQuestion({
  question,
  onAnswer,
  progress,
  currentStep,
  totalSteps,
}: AssessmentQuestionProps) {
  const labelId = useId();
  const [textValue, setTextValue] = useState("");
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);

  function handleTextSubmit() {
    const trimmed = textValue.trim();
    if (trimmed) onAnswer(trimmed);
  }

  function handleMultiToggle(option: string) {
    const next = selectedMulti.includes(option)
      ? selectedMulti.filter((o) => o !== option)
      : [...selectedMulti, option];
    setSelectedMulti(next);
  }

  function handleMultiSubmit() {
    if (selectedMulti.length > 0) onAnswer(selectedMulti);
  }

  return (
    <div className="flex min-h-screen flex-col px-5 pt-6 pb-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs text-muted">
          <span>質問 {currentStep} / {totalSteps}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border-warm">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 flex-1">
        <div className="mb-6 text-3xl">{question.emoji}</div>
        <h2
          id={labelId}
          className="text-lg font-bold leading-snug text-foreground"
        >
          {question.question}
        </h2>
      </div>

      {/* Input by type */}
      {question.type === "text" && (
        <div className="space-y-4">
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
            placeholder={question.placeholder}
            aria-labelledby={labelId}
            className="min-h-[48px] w-full rounded-xl border border-border-warm bg-white px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleTextSubmit}
            disabled={!textValue.trim()}
            className="min-h-[48px] w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
          >
            次へ →
          </button>
        </div>
      )}

      {question.type === "buttons" && question.options && (
        <div className="flex flex-col gap-3">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onAnswer(option)}
              className="min-h-[48px] rounded-xl border-2 border-border-warm bg-white px-4 py-3 text-left font-semibold text-foreground transition-colors hover:border-primary/50 active:scale-[0.98]"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {question.type === "multiselect" && question.options && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {question.options.map((option) => {
              const isSelected = selectedMulti.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleMultiToggle(option)}
                  className={`min-h-[48px] rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all active:scale-[0.98] ${
                    isSelected
                      ? "border-primary bg-primary-light text-foreground"
                      : "border-border-warm bg-white text-foreground"
                  }`}
                >
                  <span className="mr-2">{isSelected ? "✓" : ""}</span>
                  {option}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleMultiSubmit}
            disabled={selectedMulti.length === 0}
            className="min-h-[48px] w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition-transform active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100"
          >
            次へ →
          </button>
        </div>
      )}

      {question.type === "scale" && (question.options || question.scaleEmojis) && (
        <div className="flex flex-col gap-3">
          {(question.scaleEmojis ?? question.options ?? []).map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onAnswer(i + 1)}
              className="min-h-[48px] rounded-xl border-2 border-border-warm bg-white px-4 py-3 text-center font-semibold text-foreground transition-colors hover:border-primary/50 active:scale-[0.98]"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

