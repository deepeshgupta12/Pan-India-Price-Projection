import { ProjectionAnalysisResponse } from "@/types/pricing";

function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function buildCsvRow(values: Array<string | number>): string {
  return values
    .map((value) => {
      const stringValue = String(value ?? "");
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    })
    .join(",");
}

export function exportAnalysisAsJson(
  result: ProjectionAnalysisResponse,
  projectName: string,
): void {
  const safeProjectName = projectName.toLowerCase().replace(/\s+/g, "-");
  const filename = `${safeProjectName}-analysis.json`;

  downloadTextFile(
    filename,
    JSON.stringify(result, null, 2),
    "application/json;charset=utf-8",
  );
}

export function exportAnalysisAsCsv(
  result: ProjectionAnalysisResponse,
  projectName: string,
): void {
  const safeProjectName = projectName.toLowerCase().replace(/\s+/g, "-");
  const filename = `${safeProjectName}-analysis.csv`;

  const rows: string[] = [];

  rows.push(buildCsvRow(["section", "metric", "value"]));
  rows.push(buildCsvRow(["summary", "project_name", result.project_name]));
  rows.push(buildCsvRow(["summary", "scenario_code", result.scenario_code]));
  rows.push(
    buildCsvRow(["summary", "benchmark_price_psf", result.benchmark_price_psf]),
  );
  rows.push(
    buildCsvRow([
      "summary",
      "current_fair_price_psf",
      result.current_fair_price_psf,
    ]),
  );
  rows.push(
    buildCsvRow(["summary", "lower_fair_price_psf", result.lower_fair_price_psf]),
  );
  rows.push(
    buildCsvRow(["summary", "upper_fair_price_psf", result.upper_fair_price_psf]),
  );
  rows.push(
    buildCsvRow([
      "summary",
      "premium_discount_vs_benchmark_pct",
      result.premium_discount_vs_benchmark_pct,
    ]),
  );
  rows.push(
    buildCsvRow(["summary", "confidence_score", result.confidence_score]),
  );
  rows.push(
    buildCsvRow([
      "summary",
      "data_completeness_score",
      result.data_completeness_score,
    ]),
  );

  for (const factor of result.factors) {
    rows.push(
      buildCsvRow(["factor", factor.factor_name, factor.value]),
    );
  }

  for (const point of result.selected_scenario_projection_points) {
    rows.push(
      buildCsvRow([
        "projection_point",
        `${point.label}_projected_price_psf`,
        point.projected_price_psf,
      ]),
    );
  }

  for (const scenario of result.scenario_comparison) {
    rows.push(
      buildCsvRow([
        "scenario_comparison",
        `${scenario.scenario_name}_1y_price_psf`,
        scenario.projected_1y_price_psf,
      ]),
    );
    rows.push(
      buildCsvRow([
        "scenario_comparison",
        `${scenario.scenario_name}_3y_price_psf`,
        scenario.projected_3y_price_psf,
      ]),
    );
    rows.push(
      buildCsvRow([
        "scenario_comparison",
        `${scenario.scenario_name}_5y_price_psf`,
        scenario.projected_5y_price_psf,
      ]),
    );
    rows.push(
      buildCsvRow([
        "scenario_comparison",
        `${scenario.scenario_name}_annualized_growth_pct`,
        scenario.annualized_growth_pct,
      ]),
    );
  }

  for (const item of result.sensitivity_scenarios) {
    rows.push(
      buildCsvRow([
        "sensitivity",
        `${item.variable_label}_downside_price_psf`,
        item.downside_price_psf,
      ]),
    );
    rows.push(
      buildCsvRow([
        "sensitivity",
        `${item.variable_label}_upside_price_psf`,
        item.upside_price_psf,
      ]),
    );
  }

  downloadTextFile(filename, rows.join("\n"), "text/csv;charset=utf-8");
}