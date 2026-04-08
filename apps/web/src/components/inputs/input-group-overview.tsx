type InputGroupOverviewProps = {
  title: string;
  description: string;
  fields: string[];
};

export function InputGroupOverview({
  title,
  description,
  fields,
}: InputGroupOverviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {fields.map((field) => (
          <span
            key={field}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            {field}
          </span>
        ))}
      </div>
    </div>
  );
}