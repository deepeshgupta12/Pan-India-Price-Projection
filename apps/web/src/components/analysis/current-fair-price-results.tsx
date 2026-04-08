import { PricingAnalysisResponse } from "@/types/pricing";

type CurrentFairPriceResultsProps = {
  result: PricingAnalysisResponse | null;
  isLoading: boolean;
};

export function CurrentFairPriceResults({
  result,
  isLoading,
}: CurrentFairPriceResultsProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-950">
          Current fair price analysis
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Running pricing analysis...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-950">
          Current fair price analysis
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Run the analysis to view the current fair asking price, pricing band,
          benchmark delta, and factor explanation.
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