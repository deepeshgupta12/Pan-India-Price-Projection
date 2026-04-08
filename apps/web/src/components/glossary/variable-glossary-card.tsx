import { VariableDefinition } from "@/types/variable-definition";

type VariableGlossaryCardProps = {
  variable: VariableDefinition;
};

export function VariableGlossaryCard({
  variable,
}: VariableGlossaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold text-slate-950">
          {variable.display_name}
        </h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
          {variable.category}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {variable.description}
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Why it matters
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.why_it_matters}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Placeholder
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.placeholder ?? "Not specified"}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Help text
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.help_text ?? "Not specified"}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Example
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.example ?? "Not specified"}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Unit
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.unit ?? "Not specified"}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Input type
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.input_type}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Formula dependency
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.formula_dependency ?? "Not specified"}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Output impact
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-900">
            {variable.output_impact ?? "Not specified"}
          </div>
        </div>
      </div>
    </div>
  );
}