"use client";

import { useState } from "react";

import { AnalysisFieldConfig, AnalysisFormValues } from "@/types/analysis-form";

type EditableFieldCardProps = {
  field: AnalysisFieldConfig;
  value: string;
  onChange: (key: keyof AnalysisFormValues, value: string) => void;
};

function validateField(field: AnalysisFieldConfig, value: string): string | null {
  if (!value || value.trim() === "") {
    if (field.required) return `${field.label} is required`;
    return null;
  }

  if (field.inputType === "number") {
    const num = parseFloat(value);
    if (isNaN(num)) return "Must be a valid number";
    if (field.min !== undefined && num < field.min)
      return `Minimum value is ${field.min}`;
    if (field.max !== undefined && num > field.max)
      return `Maximum value is ${field.max}`;
  }

  return null;
}

export function EditableFieldCard({
  field,
  value,
  onChange,
}: EditableFieldCardProps) {
  const [touched, setTouched] = useState(false);
  const error = touched ? validateField(field, value) : null;
  const hasError = !!error;

  const handleChange = (newValue: string) => {
    onChange(field.key, newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        hasError ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-950">
            {field.label}
            {field.required && (
              <span className="text-red-500" title="Required field">
                *
              </span>
            )}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{field.helpText}</p>
        </div>

        {field.unit ? (
          <span className="flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            {field.unit}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        {field.inputType === "select" && field.options ? (
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:ring-2 focus:ring-slate-400/40 ${
              hasError
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50 focus:border-slate-400"
            }`}
          >
            <option value="">{field.placeholder}</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.inputType === "number" ? "number" : field.inputType ?? "text"}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.inputType === "number" ? "any" : undefined}
            className={`w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:ring-2 focus:ring-slate-400/40 ${
              hasError
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50 focus:border-slate-400"
            }`}
          />
        )}
      </div>

      {hasError ? (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      ) : (
        <p className="mt-2 text-xs leading-5 text-slate-400">{field.placeholder}</p>
      )}
    </div>
  );
}
