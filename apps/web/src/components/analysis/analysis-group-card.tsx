import { AnalysisFieldConfig, AnalysisFormValues } from "@/types/analysis-form";
import { EditableFieldCard } from "@/components/analysis/editable-field-card";

type AnalysisGroupCardProps = {
  title: string;
  description: string;
  fields: AnalysisFieldConfig[];
  values: AnalysisFormValues;
  onChange: (key: keyof AnalysisFormValues, value: string) => void;
};

export function AnalysisGroupCard({
  title,
  description,
  fields,
  values,
  onChange,
}: AnalysisGroupCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <EditableFieldCard
            key={field.key}
            field={field}
            value={values[field.key] as string}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}