import { AnalysisFieldConfig, AnalysisFormValues } from "@/types/analysis-form";

type EditableFieldCardProps = {
  field: AnalysisFieldConfig;
  value: string;
  onChange: (key: keyof AnalysisFormValues, value: string) => void;
};

export function EditableFieldCard({
  field,
  value,
  onChange,
}: EditableFieldCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{field.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{field.helpText}</p>
        </div>

        {field.unit ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            {field.unit}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <input
          type={field.inputType ?? "text"}
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
        />
      </div>

      <div className="mt-3 text-xs leading-5 text-slate-500">
        Placeholder: {field.placeholder}
      </div>
    </div>
  );
}