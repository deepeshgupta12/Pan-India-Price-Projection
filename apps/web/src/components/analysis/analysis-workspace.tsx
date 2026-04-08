"use client";

import { useEffect, useMemo, useState } from "react";

import {
  analysisInputGroups,
  buildAnalysisFormValuesFromProject,
  buildInitialAnalysisFormValues,
} from "@/lib/analysis-form";
import {
  exportProjectionAnalysisCsv,
  fetchSavedAnalyses,
  runProjectionSummaryAnalysis,
  saveProjectionAnalysis,
} from "@/lib/api";
import { AnalysisGroupCard } from "@/components/analysis/analysis-group-card";
import { CurrentFairPriceResults } from "@/components/analysis/current-fair-price-results";
import { ScenarioSelector } from "@/components/analysis/scenario-selector";
import { ProjectSearchPanel } from "@/components/search/project-search-panel";
import { StatPill } from "@/components/ui/stat-pill";
import { City } from "@/types/city";
import { AnalysisFormValues } from "@/types/analysis-form";
import {
  ProjectionAnalysisResponse,
  SavedAnalysisListItem,
} from "@/types/pricing";
import { Project } from "@/types/project";
import { ScenarioProfile } from "@/types/scenario-profile";

type AnalysisWorkspaceProps = {
  cities: City[];
  projects: Project[];
  scenarios: ScenarioProfile[];
};

function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

function buildExportFileBaseName(
  projectName: string,
  scenarioCode: string,
): string {
  const safeProjectName = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeProjectName || "analysis"}-${scenarioCode.toLowerCase()}`;
}

export function AnalysisWorkspace({
  cities,
  projects,
  scenarios,
}: AnalysisWorkspaceProps) {
  const defaultScenarioCode =
    scenarios.find((scenario) => scenario.is_default)?.scenario_code ??
    scenarios[0]?.scenario_code ??
    "";

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    projects[0]?.id ?? null,
  );
  const [selectedScenarioCode, setSelectedScenarioCode] =
    useState<string>(defaultScenarioCode);
  const [projectOverrides, setProjectOverrides] = useState<
    Record<number, AnalysisFormValues>
  >({});
  const [analysisResult, setAnalysisResult] =
    useState<ProjectionAnalysisResponse | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysisListItem[]>([]);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? null;

  const selectedScenario = useMemo(
    () =>
      scenarios.find(
        (scenario) => scenario.scenario_code === selectedScenarioCode,
      ) ?? null,
    [scenarios, selectedScenarioCode],
  );

  const formValues = useMemo<AnalysisFormValues>(() => {
    if (!selectedProject) {
      return buildInitialAnalysisFormValues();
    }

    return (
      projectOverrides[selectedProject.id] ??
      buildAnalysisFormValuesFromProject(selectedProject)
    );
  }, [projectOverrides, selectedProject]);

  useEffect(() => {
    async function loadSavedAnalyses(): Promise<void> {
      const data = await fetchSavedAnalyses();
      setSavedAnalyses(data);
    }

    void loadSavedAnalyses();
  }, []);

  function handleFieldChange(
    key: keyof AnalysisFormValues,
    value: string,
  ): void {
    if (!selectedProject) {
      return;
    }

    setProjectOverrides((previous) => {
      const baseValues =
        previous[selectedProject.id] ??
        buildAnalysisFormValuesFromProject(selectedProject);

      return {
        ...previous,
        [selectedProject.id]: {
          ...baseValues,
          [key]: value,
        },
      };
    });

    setAnalysisResult(null);
    setSaveMessage("");
  }

  async function handleRunAnalysis(): Promise<void> {
    if (!selectedProject || isAnalysisLoading) {
      return;
    }

    setIsAnalysisLoading(true);
    setSaveMessage("");

    const result = await runProjectionSummaryAnalysis({
      ...formValues,
      scenario_code: selectedScenarioCode,
    });

    setAnalysisResult(result);
    setIsAnalysisLoading(false);
  }

  async function handleSaveAnalysis(): Promise<void> {
    if (!analysisResult || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    const timestamp = new Date().toLocaleString("en-IN");
    const saved = await saveProjectionAnalysis({
      analysis_name: `${analysisResult.project_name} · ${analysisResult.scenario_code.toUpperCase()} · ${timestamp}`,
      result: analysisResult,
    });

    if (saved) {
      setSaveMessage("Analysis saved successfully.");
      const refreshed = await fetchSavedAnalyses();
      setSavedAnalyses(refreshed);
    } else {
      setSaveMessage("Unable to save analysis.");
    }

    setIsSaving(false);
  }

  function handleExportJson(): void {
    if (!analysisResult) {
      return;
    }

    const fileBaseName = buildExportFileBaseName(
      analysisResult.project_name,
      analysisResult.scenario_code,
    );

    downloadFile(
      JSON.stringify(analysisResult, null, 2),
      `${fileBaseName}.json`,
      "application/json",
    );
  }

  async function handleExportCsv(): Promise<void> {
    if (!analysisResult || !selectedProject) {
      return;
    }

    const csvContent = await exportProjectionAnalysisCsv({
      ...formValues,
      scenario_code: selectedScenarioCode,
    });

    if (!csvContent) {
      setSaveMessage("Unable to export CSV.");
      return;
    }

    const fileBaseName = buildExportFileBaseName(
      analysisResult.project_name,
      analysisResult.scenario_code,
    );

    downloadFile(csvContent, `${fileBaseName}.csv`, "text/csv;charset=utf-8");
  }

  return (
    <div className="space-y-10">
      <ProjectSearchPanel
        cities={cities}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(projectId) => {
          setSelectedProjectId(projectId);
          setAnalysisResult(null);
          setSaveMessage("");
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenarioCode={selectedScenarioCode}
            onChange={(scenarioCode) => {
              setSelectedScenarioCode(scenarioCode);
              setAnalysisResult(null);
              setSaveMessage("");
            }}
          />

          <CurrentFairPriceResults
            result={analysisResult}
            isLoading={isAnalysisLoading}
          />

          {analysisInputGroups.map((group) => (
            <AnalysisGroupCard
              key={group.title}
              title={group.title}
              description={group.description}
              fields={group.fields}
              values={formValues}
              onChange={handleFieldChange}
            />
          ))}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Analysis state
            </div>

            <div className="mt-4 space-y-5">
              <div>
                <div className="text-sm font-semibold text-white">
                  Selected project
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-200">
                  {selectedProject?.project_name ?? "No project selected"}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-white">
                  Selected scenario
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-200">
                  {selectedScenario?.scenario_name ?? "No scenario selected"}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <StatPill
                  label="Project stage"
                  value={formValues.project_stage || "Not set"}
                />
                <StatPill
                  label="Benchmark price"
                  value={
                    formValues.benchmark_current_asking_price
                      ? `₹${formValues.benchmark_current_asking_price}`
                      : "Not set"
                  }
                />
              </div>

              {analysisResult ? (
                <div className="grid gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                      Latest fair price
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      ₹
                      {analysisResult.current_fair_price_psf.toLocaleString(
                        "en-IN",
                      )}{" "}
                      / sq ft
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                      5Y selected scenario projection
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      ₹
                      {analysisResult.selected_scenario_projection_points
                        .find((point) => point.year === 5)
                        ?.projected_price_psf.toLocaleString("en-IN") ?? "N/A"}{" "}
                      / sq ft
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                      Top sensitivity driver
                    </div>
                    <div className="mt-2 text-base font-semibold text-white">
                      {analysisResult.top_sensitivity_driver}
                    </div>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalysisLoading || !selectedProject}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalysisLoading
                  ? "Running analysis..."
                  : "Run fair price, projection, and sensitivity analysis"}
              </button>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={handleSaveAnalysis}
                  disabled={!analysisResult || isSaving}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={handleExportJson}
                  disabled={!analysisResult}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export JSON
                </button>

                <button
                  type="button"
                  onClick={() => void handleExportCsv()}
                  disabled={!analysisResult}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>

              {saveMessage ? (
                <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200">
                  {saveMessage}
                </div>
              ) : null}

              <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200">
                The analysis engine now returns current fair price, 1Y / 3Y / 5Y
                projections, sensitivity scenarios, richer interpretation, and
                export-ready results.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-slate-950">
                Saved analyses
              </div>
              <div className="text-xs text-slate-500">
                {savedAnalyses.length} saved
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {savedAnalyses.length > 0 ? (
                savedAnalyses.slice(0, 5).map((item) => (
                  <div
                    key={item.analysis_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-sm font-semibold text-slate-950">
                      {item.analysis_name}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {item.project_name} · {item.scenario_code.toUpperCase()}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  No saved analyses yet. Run an analysis and click Save.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-950">
              Prefill logic
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              When a project is selected, the analysis form is initialized from
              that project’s dictionary record. Any field edits are stored as
              project-specific overrides, so changing projects does not rely on a
              synchronous effect-driven reset.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}