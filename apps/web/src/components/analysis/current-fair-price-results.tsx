import {
  PricingAnalysisResponse,
  ProjectionAnalysisResponse,
} from "@/types/pricing";
import { ProjectionCharts } from "@/components/analysis/projection-charts";

type CurrentFairPriceResultsProps = {
  result: ProjectionAnalysisResponse | PricingAnalysisResponse | null;
  isLoading: boolean;
};

function hasProjectionData(
  result: ProjectionAnalysisResponse | PricingAnalysisResponse,
): result is ProjectionAnalysisResponse {
  return (
    "selected_scenario_projection_points" in result &&
    "scenario_comparison" in result
  );
}

export function CurrentFairPriceResults({
  result,
  isLoading,
}: CurrentFairPriceResultsProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-950">
          Analysis results
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Running pricing, projection, and sensitivity analysis...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-950">
          Analysis results
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Run the analysis to view current fair asking price, fair value band,
          factor contribution, forward projections, and sensitivity outputs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Current fair price output
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The result below is based on the current benchmark and the edited
            input assumptions in the workspace.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Fair asking price
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-950">
              ₹{result.current_fair_price_psf.toLocaleString("en-IN")} / sq ft
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Fair price band
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950">
              ₹{result.lower_fair_price_psf.toLocaleString("en-IN")} to ₹
              {result.upper_fair_price_psf.toLocaleString("en-IN")} / sq ft
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Benchmark delta
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950">
              {result.premium_discount_vs_benchmark_pct >= 0 ? "+" : ""}
              {result.premium_discount_vs_benchmark_pct.toFixed(2)}%
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Confidence score
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-950">
              {result.confidence_score.toFixed(2)} / 100
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
          {result.summary}
        </div>
      </section>

      {hasProjectionData(result) ? (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Forward projection summary
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                1Y, 3Y, and 5Y projections are derived from the current fair
                price baseline and the selected scenario assumptions.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {result.scenario_comparison
                .filter(
                  (scenario) =>
                    scenario.scenario_code === result.scenario_code,
                )
                .map((scenario) => (
                  <div
                    key={scenario.scenario_code}
                    className="contents"
                  >
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        1Y projection
                      </div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">
                        ₹{scenario.projected_1y_price_psf.toLocaleString("en-IN")} / sq ft
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        3Y projection
                      </div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">
                        ₹{scenario.projected_3y_price_psf.toLocaleString("en-IN")} / sq ft
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        5Y projection
                      </div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">
                        ₹{scenario.projected_5y_price_psf.toLocaleString("en-IN")} / sq ft
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              {result.selected_scenario_growth_summary}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Interpretation and confidence
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These narrative outputs explain how the model is reading the
                current pricing stance.
              </p>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm font-semibold text-slate-950">
                  Interpretation bullets
                </div>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                  {result.interpretation_bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-950">
                    Confidence explanation
                  </div>
                  <div className="mt-3 text-base font-semibold text-slate-950">
                    {result.confidence_explanation.label}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {result.confidence_explanation.explanation}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-950">
                    Risk flags
                  </div>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                    {result.risk_flags.map((flag) => (
                      <li key={flag}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Sensitivity summary
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This section shows how fair price changes when key assumptions
                move up or down from the current base case.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
              Top sensitivity driver: <span className="font-semibold">{result.top_sensitivity_driver}</span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {result.sensitivity_scenarios.map((scenario) => (
                <div
                  key={scenario.variable_key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-base font-semibold text-slate-950">
                      {scenario.variable_label}
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-950 shadow-sm">
                      Base ₹{scenario.base_price_psf.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Downside case
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-950">
                        ₹{scenario.downside_price_psf.toLocaleString("en-IN")} / sq ft
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {scenario.downside_change_pct >= 0 ? "+" : ""}
                        {scenario.downside_change_pct.toFixed(2)}%
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Upside case
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-950">
                        ₹{scenario.upside_price_psf.toLocaleString("en-IN")} / sq ft
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {scenario.upside_change_pct >= 0 ? "+" : ""}
                        {scenario.upside_change_pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {scenario.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <ProjectionCharts
            projectionPoints={result.selected_scenario_projection_points}
            scenarioComparison={result.scenario_comparison}
          />
        </>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Factor contribution
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These are the initial pricing drivers used by the backend engine for
            the current fair value output.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {result.factors.map((factor) => (
            <div
              key={factor.factor_name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-base font-semibold text-slate-950">
                  {factor.factor_name}
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-950 shadow-sm">
                  {factor.value >= 0 ? "+" : ""}
                  {factor.value.toFixed(2)}%
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {factor.explanation}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}