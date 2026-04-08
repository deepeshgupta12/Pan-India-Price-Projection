"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ProjectionPoint, ScenarioProjectionSummary } from "@/types/pricing";

type ProjectionChartsProps = {
  projectionPoints: ProjectionPoint[];
  scenarioComparison: ScenarioProjectionSummary[];
};

function formatCurrencyTooltip(value: unknown): string {
  if (typeof value === "number") {
    return `₹${value.toLocaleString("en-IN")} / sq ft`;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return `₹${parsed.toLocaleString("en-IN")} / sq ft`;
    }
  }
  return "N/A";
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ProjectionCharts({
  projectionPoints,
  scenarioComparison,
}: ProjectionChartsProps) {
  const hasProjectionData = projectionPoints && projectionPoints.length >= 2;
  const hasComparisonData = scenarioComparison && scenarioComparison.length >= 1;

  const comparisonData = hasComparisonData
    ? scenarioComparison.map((scenario) => ({
        scenario: scenario.scenario_name,
        "1Y": scenario.projected_1y_price_psf,
        "3Y": scenario.projected_3y_price_psf,
        "5Y": scenario.projected_5y_price_psf,
      }))
    : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          Projection charts
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          Selected scenario trend and cross-scenario comparison at 1Y, 3Y, and 5Y horizons.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Trend chart */}
        <div>
          <div className="mb-4 text-sm font-semibold text-slate-700">
            Selected scenario projection trend
          </div>
          {hasProjectionData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      `₹${(v / 1000).toFixed(0)}k`
                    }
                    width={50}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrencyTooltip(value), "Projected price"]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected_price_psf"
                    name="Projected price"
                    stroke="#1e293b"
                    activeDot={{ r: 5, fill: "#1e293b" }}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#1e293b", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState message="No projection data available for this scenario." />
          )}
        </div>

        {/* Scenario comparison bar chart */}
        <div>
          <div className="mb-4 text-sm font-semibold text-slate-700">
            Scenario comparison — 1Y / 3Y / 5Y
          </div>
          {hasComparisonData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="scenario"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      `₹${(v / 1000).toFixed(0)}k`
                    }
                    width={50}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrencyTooltip(value)]}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="1Y" fill="#1e293b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="3Y" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="5Y" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState message="No scenario comparison data available." />
          )}
        </div>
      </div>
    </section>
  );
}
