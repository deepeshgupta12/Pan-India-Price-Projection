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

import {
ProjectionPoint,
ScenarioProjectionSummary,
} from "@/types/pricing";

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

export function ProjectionCharts({
projectionPoints,
scenarioComparison,
}: ProjectionChartsProps) {
const comparisonData = scenarioComparison.map((scenario) => ({
scenario: scenario.scenario_name,
"1Y": scenario.projected_1y_price_psf,
"3Y": scenario.projected_3y_price_psf,
"5Y": scenario.projected_5y_price_psf,
}));

return (
<div className="grid gap-6 xl:grid-cols-2">
<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
<div className="border-b border-slate-100 pb-4">
<h2 className="text-xl font-semibold tracking-tight text-slate-950">
Selected scenario projection trend
</h2>
<p className="mt-2 text-sm leading-6 text-slate-600">
This chart shows how the current fair price evolves across the
selected scenario over time.
</p>
</div>

<div className="mt-5 h-80">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={projectionPoints}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="label" />
<YAxis />
<Tooltip formatter={(value) => formatCurrencyTooltip(value)} />
<Legend />
<Line
type="monotone"
dataKey="projected_price_psf"
name="Projected price"
stroke="#2563eb"
activeDot={{ r: 6 }}
strokeWidth={3}
/>
</LineChart>
</ResponsiveContainer>
</div>
</section>

<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
<div className="border-b border-slate-100 pb-4">
<h2 className="text-xl font-semibold tracking-tight text-slate-950">
Scenario comparison
</h2>
<p className="mt-2 text-sm leading-6 text-slate-600">
Compare projected fair price outcomes across bear, base, and bull
scenarios.
</p>
</div>

<div className="mt-5 h-80">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={comparisonData}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="scenario" />
<YAxis />
<Tooltip formatter={(value) => formatCurrencyTooltip(value)} />
<Legend />
<Bar dataKey="1Y" fill="#2563eb" />
<Bar dataKey="3Y" fill="#8b5cf6" />
<Bar dataKey="5Y" fill="#14b8a6" />
</BarChart>
</ResponsiveContainer>
</div>
</section>
</div>
);
}