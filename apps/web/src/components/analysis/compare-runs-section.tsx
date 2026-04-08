"use client";

import { SavedAnalysisDetailResponse } from "@/types/pricing";

type CompareRunsSectionProps = {
  analysisA: SavedAnalysisDetailResponse;
  analysisB: SavedAnalysisDetailResponse;
  onClose: () => void;
};

type CompareRow = {
  label: string;
  valueA: string;
  valueB: string;
  rawA?: number;
  rawB?: number;
  higherIsBetter?: boolean;
};

function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-IN")} / sq ft`;
}

function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function WinnerTag({ label }: { label: string }) {
  return (
    <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
      {label}
    </span>
  );
}

export function CompareRunsSection({
  analysisA,
  analysisB,
  onClose,
}: CompareRunsSectionProps) {
  const rA = analysisA.result;
  const rB = analysisB.result;

  // Pull scenario-matched projection rows
  const proj1yA = rA.scenario_comparison.find(
    (s) => s.scenario_code === rA.scenario_code,
  )?.projected_1y_price_psf;
  const proj3yA = rA.scenario_comparison.find(
    (s) => s.scenario_code === rA.scenario_code,
  )?.projected_3y_price_psf;
  const proj5yA = rA.scenario_comparison.find(
    (s) => s.scenario_code === rA.scenario_code,
  )?.projected_5y_price_psf;
  const proj1yB = rB.scenario_comparison.find(
    (s) => s.scenario_code === rB.scenario_code,
  )?.projected_1y_price_psf;
  const proj3yB = rB.scenario_comparison.find(
    (s) => s.scenario_code === rB.scenario_code,
  )?.projected_3y_price_psf;
  const proj5yB = rB.scenario_comparison.find(
    (s) => s.scenario_code === rB.scenario_code,
  )?.projected_5y_price_psf;

  const rows: CompareRow[] = [
    {
      label: "Current fair price",
      valueA: formatInr(rA.current_fair_price_psf),
      valueB: formatInr(rB.current_fair_price_psf),
      rawA: rA.current_fair_price_psf,
      rawB: rB.current_fair_price_psf,
      higherIsBetter: true,
    },
    {
      label: "Fair price band",
      valueA: `₹${rA.lower_fair_price_psf.toLocaleString("en-IN")} – ₹${rA.upper_fair_price_psf.toLocaleString("en-IN")}`,
      valueB: `₹${rB.lower_fair_price_psf.toLocaleString("en-IN")} – ₹${rB.upper_fair_price_psf.toLocaleString("en-IN")}`,
    },
    {
      label: "Benchmark delta",
      valueA: formatPct(rA.premium_discount_vs_benchmark_pct),
      valueB: formatPct(rB.premium_discount_vs_benchmark_pct),
      rawA: rA.premium_discount_vs_benchmark_pct,
      rawB: rB.premium_discount_vs_benchmark_pct,
      higherIsBetter: true,
    },
    {
      label: "Confidence score",
      valueA: `${rA.confidence_score.toFixed(1)} / 100`,
      valueB: `${rB.confidence_score.toFixed(1)} / 100`,
      rawA: rA.confidence_score,
      rawB: rB.confidence_score,
      higherIsBetter: true,
    },
    {
      label: "1Y projection",
      valueA: proj1yA != null ? formatInr(proj1yA) : "N/A",
      valueB: proj1yB != null ? formatInr(proj1yB) : "N/A",
      rawA: proj1yA,
      rawB: proj1yB,
      higherIsBetter: true,
    },
    {
      label: "3Y projection",
      valueA: proj3yA != null ? formatInr(proj3yA) : "N/A",
      valueB: proj3yB != null ? formatInr(proj3yB) : "N/A",
      rawA: proj3yA,
      rawB: proj3yB,
      higherIsBetter: true,
    },
    {
      label: "5Y projection",
      valueA: proj5yA != null ? formatInr(proj5yA) : "N/A",
      valueB: proj5yB != null ? formatInr(proj5yB) : "N/A",
      rawA: proj5yA,
      rawB: proj5yB,
      higherIsBetter: true,
    },
    {
      label: "Top sensitivity driver",
      valueA: rA.top_sensitivity_driver,
      valueB: rB.top_sensitivity_driver,
    },
    {
      label: "Scenario",
      valueA: rA.scenario_code.toUpperCase(),
      valueB: rB.scenario_code.toUpperCase(),
    },
  ];

  function getWinner(row: CompareRow): "a" | "b" | "tie" | null {
    if (
      row.rawA == null ||
      row.rawB == null ||
      row.higherIsBetter == null
    ) {
      return null;
    }
    if (row.rawA === row.rawB) return "tie";
    if (row.higherIsBetter) return row.rawA > row.rawB ? "a" : "b";
    return row.rawA < row.rawB ? "a" : "b";
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 border-b border-slate-100 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Analysis comparison
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Side-by-side comparison
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Key pricing and projection metrics compared across two saved analysis
            runs. Highlighted cells indicate the stronger result for each metric.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Close comparison
        </button>
      </div>

      {/* Comparison table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse overflow-hidden rounded-2xl">
          <thead>
            <tr>
              <th className="w-[200px] rounded-tl-2xl bg-slate-50 p-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Metric
              </th>
              <th className="rounded-tr-none bg-slate-950 p-4 text-left align-top">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Analysis A
                </div>
                <div className="mt-1 text-sm font-semibold leading-5 text-white">
                  {analysisA.analysis_name}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {analysisA.project_name} ·{" "}
                  {analysisA.scenario_code.toUpperCase()}
                </div>
              </th>
              <th className="rounded-tr-2xl bg-slate-800 p-4 text-left align-top">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Analysis B
                </div>
                <div className="mt-1 text-sm font-semibold leading-5 text-white">
                  {analysisB.analysis_name}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {analysisB.project_name} ·{" "}
                  {analysisB.scenario_code.toUpperCase()}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const winner = getWinner(row);
              const isLast = index === rows.length - 1;

              return (
                <tr
                  key={row.label}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <td
                    className={`border-t border-slate-100 p-4 text-sm text-slate-600 ${
                      isLast ? "rounded-bl-2xl" : ""
                    }`}
                  >
                    {row.label}
                  </td>
                  <td
                    className={`border-l border-t border-slate-100 p-4 ${
                      winner === "a"
                        ? "bg-emerald-50/60"
                        : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-slate-950">
                        {row.valueA}
                      </span>
                      {winner === "a" ? <WinnerTag label="Better" /> : null}
                    </div>
                  </td>
                  <td
                    className={`border-l border-t border-slate-100 p-4 ${
                      isLast ? "rounded-br-2xl" : ""
                    } ${winner === "b" ? "bg-emerald-50/60" : ""}`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-slate-950">
                        {row.valueB}
                      </span>
                      {winner === "b" ? <WinnerTag label="Better" /> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interpretation summaries */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Analysis A · Interpretation
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{rA.summary}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Analysis B · Interpretation
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{rB.summary}</p>
        </div>
      </div>

      {/* Risk flags side by side */}
      {(rA.risk_flags.length > 0 || rB.risk_flags.length > 0) ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              Analysis A · Risk flags
            </div>
            <ul className="mt-3 space-y-1">
              {rA.risk_flags.map((flag) => (
                <li key={flag} className="text-sm leading-6 text-amber-900">
                  · {flag}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              Analysis B · Risk flags
            </div>
            <ul className="mt-3 space-y-1">
              {rB.risk_flags.map((flag) => (
                <li key={flag} className="text-sm leading-6 text-amber-900">
                  · {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
