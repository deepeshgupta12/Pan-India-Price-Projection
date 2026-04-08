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

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-slate-900 bg-slate-950"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div
        className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
          accent ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-2 text-xl font-semibold leading-tight ${
          accent ? "text-white" : "text-slate-950"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-b border-slate-100 pb-4">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{subtitle}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CurrentFairPriceResults({
  result,
  isLoading,
}: CurrentFairPriceResultsProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <div className="text-sm font-semibold text-slate-700">
            Running pricing, projection, and sensitivity analysis…
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The engine is computing fair price, confidence scores, 1Y / 3Y / 5Y
          projections, scenario comparison, and sensitivity outputs.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
        <div className="text-sm font-semibold text-slate-700">
          No analysis results yet
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Configure inputs in the cards below and click{" "}
          <strong className="font-semibold text-slate-700">
            Run fair price, projection and sensitivity analysis
          </strong>{" "}
          in the sidebar to see current fair asking price, fair value band,
          forward projections, and sensitivity outputs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Current fair price ─────────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Current fair price"
          subtitle="Derived from benchmark, location, developer, product, and risk factors applied to the current input assumptions."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Fair asking price"
            value={`₹${result.current_fair_price_psf.toLocaleString("en-IN")} / sq ft`}
            accent
          />
          <MetricCard
            label="Fair price band"
            value={`₹${result.lower_fair_price_psf.toLocaleString("en-IN")} – ₹${result.upper_fair_price_psf.toLocaleString("en-IN")}`}
          />
          <MetricCard
            label="Benchmark delta"
            value={`${result.premium_discount_vs_benchmark_pct >= 0 ? "+" : ""}${result.premium_discount_vs_benchmark_pct.toFixed(2)}%`}
          />
          <MetricCard
            label="Confidence score"
            value={`${result.confidence_score.toFixed(1)} / 100`}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
          {result.summary}
        </div>
      </section>

      {/* ── Projection + interpretation (only for full projection response) ── */}
      {hasProjectionData(result) ? (
        <>
          {/* Forward projection summary */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Forward projections"
              subtitle="1Y, 3Y, and 5Y price projections derived from the current fair price baseline and the selected scenario growth assumptions."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {result.scenario_comparison
                .filter((s) => s.scenario_code === result.scenario_code)
                .map((scenario) => (
                  <div key={scenario.scenario_code} className="contents">
                    <MetricCard
                      label="1Y projection"
                      value={`₹${scenario.projected_1y_price_psf.toLocaleString("en-IN")} / sq ft`}
                    />
                    <MetricCard
                      label="3Y projection"
                      value={`₹${scenario.projected_3y_price_psf.toLocaleString("en-IN")} / sq ft`}
                    />
                    <MetricCard
                      label="5Y projection"
                      value={`₹${scenario.projected_5y_price_psf.toLocaleString("en-IN")} / sq ft`}
                    />
                  </div>
                ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              {result.selected_scenario_growth_summary}
            </div>
          </section>

          {/* Interpretation + confidence */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Interpretation and confidence"
              subtitle="Narrative outputs explaining how the model reads the current pricing stance, key risk signals, and confidence level."
            />

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              {/* Interpretation bullets */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Interpretation
                </div>
                <ul className="mt-4 space-y-3">
                  {result.interpretation_bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                {/* Confidence */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Confidence
                  </div>
                  <div className="mt-3 text-base font-semibold text-slate-950">
                    {result.confidence_explanation.label}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {result.confidence_explanation.explanation}
                  </p>
                </div>

                {/* Risk flags */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                    Risk flags
                  </div>
                  <ul className="mt-3 space-y-2">
                    {result.risk_flags.map((flag) => (
                      <li
                        key={flag}
                        className="flex items-start gap-2 text-sm leading-6 text-amber-900"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Sensitivity summary */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Sensitivity analysis"
              subtitle="How the fair price changes when key input assumptions shift up or down from the current base case."
            />

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Top driver
              </div>
              <div className="text-sm font-semibold text-slate-950">
                {result.top_sensitivity_driver}
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {result.sensitivity_scenarios.map((scenario) => (
                <div
                  key={scenario.variable_key}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-semibold text-slate-950">
                      {scenario.variable_label}
                    </div>
                    <div className="flex-shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                      Base ₹{scenario.base_price_psf.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Downside
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-slate-950">
                        ₹{scenario.downside_price_psf.toLocaleString("en-IN")}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {scenario.downside_change_pct >= 0 ? "+" : ""}
                        {scenario.downside_change_pct.toFixed(2)}%
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Upside
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-slate-950">
                        ₹{scenario.upside_price_psf.toLocaleString("en-IN")}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
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

          {/* Projection charts */}
          <ProjectionCharts
            projectionPoints={result.selected_scenario_projection_points}
            scenarioComparison={result.scenario_comparison}
          />
        </>
      ) : null}

      {/* ── Factor contribution ───────────────────────────────────────── */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader
          title="Factor contribution"
          subtitle="The pricing drivers applied by the engine to arrive at the current fair value output."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {result.factors.map((factor) => (
            <div
              key={factor.factor_name}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-semibold text-slate-950">
                  {factor.factor_name}
                </div>
                <div
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ${
                    factor.value >= 0
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-red-50 text-red-700 ring-red-200"
                  }`}
                >
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
