"use client";

import { ScenarioProfile } from "@/types/scenario-profile";

type ScenarioSelectorProps = {
  scenarios: ScenarioProfile[];
  selectedScenarioCode: string;
  onChange: (scenarioCode: string) => void;
};

export function ScenarioSelector({
  scenarios,
  selectedScenarioCode,
  onChange,
}: ScenarioSelectorProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Scenario profile
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This selection will later influence the pricing and projection engine
          assumptions for bear, base, bull, and custom analysis.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {scenarios.map((scenario) => {
          const isSelected = scenario.scenario_code === selectedScenarioCode;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onChange(scenario.scenario_code)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                isSelected
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-950"
              }`}
            >
              <div className="text-sm font-semibold">{scenario.scenario_name}</div>
              <p
                className={`mt-2 text-sm leading-6 ${
                  isSelected ? "text-slate-200" : "text-slate-600"
                }`}
              >
                {scenario.description ?? "No description available"}
              </p>

              <div
                className={`mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  isSelected ? "text-slate-300" : "text-slate-500"
                }`}
              >
                Market CAGR
              </div>
              <div className="mt-1 text-sm font-semibold">
                {scenario.market_cagr !== null
                  ? `${(scenario.market_cagr * 100).toFixed(1)}%`
                  : "Not specified"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}