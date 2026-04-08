import { Project } from "@/types/project";

type ProjectCardProps = {
  project: Project;
  isSelected?: boolean;
};

function formatUnitMix(unitMixSummary: Project["unit_mix_summary"]): string {
  if (!unitMixSummary || Array.isArray(unitMixSummary)) {
    return "Unit mix not available";
  }

  return Object.entries(unitMixSummary)
    .map(([key, value]) => `${key.replaceAll("_", " ").toUpperCase()}: ${value}`)
    .join(" • ");
}

export function ProjectCard({
  project,
  isSelected = false,
}: ProjectCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        isSelected
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-950"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{project.project_name}</h3>
          <p
            className={`mt-2 text-sm leading-6 ${
              isSelected ? "text-slate-200" : "text-slate-600"
            }`}
          >
            {project.address_text ?? "Address not available"}
          </p>
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
            isSelected
              ? "bg-white/15 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {project.project_stage ?? "Stage N/A"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isSelected ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Benchmark asking price
          </div>
          <div className="mt-1 text-sm font-semibold">
            {project.benchmark_current_asking_price
              ? `₹${project.benchmark_current_asking_price.toLocaleString("en-IN")} / sq ft`
              : "Not available"}
          </div>
        </div>

        <div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isSelected ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Average unit size
          </div>
          <div className="mt-1 text-sm font-semibold">
            {project.avg_unit_size_sqft
              ? `${project.avg_unit_size_sqft.toLocaleString("en-IN")} sq ft`
              : "Not available"}
          </div>
        </div>

        <div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isSelected ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Total units
          </div>
          <div className="mt-1 text-sm font-semibold">
            {project.total_units?.toLocaleString("en-IN") ?? "Not available"}
          </div>
        </div>

        <div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isSelected ? "text-slate-300" : "text-slate-500"
            }`}
          >
            RERA status
          </div>
          <div className="mt-1 text-sm font-semibold">
            {project.rera_status ?? "Not available"}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
            isSelected ? "text-slate-300" : "text-slate-500"
          }`}
        >
          Unit mix
        </div>
        <div className="mt-1 text-sm leading-6">
          {formatUnitMix(project.unit_mix_summary)}
        </div>
      </div>
    </div>
  );
}