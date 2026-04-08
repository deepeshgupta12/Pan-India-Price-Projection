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
  fetchSavedAnalysisById,
  runProjectionSummaryAnalysis,
  saveProjectionAnalysis,
} from "@/lib/api";
import { analytics } from "@/lib/analytics";
import { AnalysisGroupCard } from "@/components/analysis/analysis-group-card";
import { CurrentFairPriceResults } from "@/components/analysis/current-fair-price-results";
import { ScenarioSelector } from "@/components/analysis/scenario-selector";
import { SavedAnalysisPanel } from "@/components/analysis/saved-analysis-panel";
import { CompareRunsSection } from "@/components/analysis/compare-runs-section";
import { ProjectSearchPanel } from "@/components/search/project-search-panel";
import { StatPill } from "@/components/ui/stat-pill";
import { City } from "@/types/city";
import { AnalysisFormValues } from "@/types/analysis-form";
import {
  ProjectionAnalysisResponse,
  SavedAnalysisDetailResponse,
  SavedAnalysisListItem,
} from "@/types/pricing";
import { Project } from "@/types/project";
import { ScenarioProfile } from "@/types/scenario-profile";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalysisWorkspaceProps = {
  cities: City[];
  projects: Project[];
  scenarios: ScenarioProfile[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildExportFileBaseName(projectName: string, scenarioCode: string): string {
  const safeProjectName = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${safeProjectName || "analysis"}-${scenarioCode.toLowerCase()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalysisWorkspace({ cities, projects, scenarios }: AnalysisWorkspaceProps) {
  const defaultScenarioCode =
    scenarios.find((s) => s.is_default)?.scenario_code ??
    scenarios[0]?.scenario_code ??
    "";

  // ── Core workspace state ─────────────────────────────────────────────────
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
  const [saveMessage, setSaveMessage] = useState<string>("");

  // ── Saved analyses state ─────────────────────────────────────────────────
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysisListItem[]>([]);
  const [reopenedAnalysis, setReopenedAnalysis] =
    useState<SavedAnalysisDetailResponse | null>(null);
  const [openingAnalysisId, setOpeningAnalysisId] = useState<string | null>(null);

  // ── Compare state ────────────────────────────────────────────────────────
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareDetails, setCompareDetails] = useState<
    [SavedAnalysisDetailResponse, SavedAnalysisDetailResponse] | null
  >(null);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  // ── Derived values ───────────────────────────────────────────────────────
  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? null;

  const selectedScenario = useMemo(
    () => scenarios.find((s) => s.scenario_code === selectedScenarioCode) ?? null,
    [scenarios, selectedScenarioCode],
  );

  const formValues = useMemo<AnalysisFormValues>(() => {
    if (!selectedProject) return buildInitialAnalysisFormValues();
    return (
      projectOverrides[selectedProject.id] ??
      buildAnalysisFormValuesFromProject(selectedProject)
    );
  }, [projectOverrides, selectedProject]);

  // The result to display: if a saved analysis is reopened, show its result;
  // otherwise show the freshly run result.
  const resultToDisplay = reopenedAnalysis?.result ?? analysisResult;

  // ── Startup: load saved analyses ─────────────────────────────────────────
  useEffect(() => {
    async function loadSavedAnalyses(): Promise<void> {
      const data = await fetchSavedAnalyses();
      setSavedAnalyses(data);
    }
    void loadSavedAnalyses();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleSelectProject(projectId: number): void {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      analytics.selectedProject(projectId, project.project_name);
    }
    setSelectedProjectId(projectId);
    setAnalysisResult(null);
    setReopenedAnalysis(null);
    setSaveMessage("");
  }

  function handleScenarioChange(scenarioCode: string): void {
    const scenario = scenarios.find((s) => s.scenario_code === scenarioCode);
    analytics.changedScenario(scenarioCode, scenario?.scenario_name ?? scenarioCode);
    setSelectedScenarioCode(scenarioCode);
    setAnalysisResult(null);
    setReopenedAnalysis(null);
    setSaveMessage("");
  }

  function handleFieldChange(key: keyof AnalysisFormValues, value: string): void {
    if (!selectedProject) return;
    analytics.editedInput(key);
    setProjectOverrides((previous) => {
      const baseValues =
        previous[selectedProject.id] ??
        buildAnalysisFormValuesFromProject(selectedProject);
      return {
        ...previous,
        [selectedProject.id]: { ...baseValues, [key]: value },
      };
    });
    setAnalysisResult(null);
    setSaveMessage("");
  }

  async function handleRunAnalysis(): Promise<void> {
    if (!selectedProject || isAnalysisLoading) return;
    analytics.ranAnalysis(selectedProject.project_name, selectedScenarioCode);
    setIsAnalysisLoading(true);
    setReopenedAnalysis(null);
    setSaveMessage("");

    const result = await runProjectionSummaryAnalysis({
      ...formValues,
      scenario_code: selectedScenarioCode,
    });

    setAnalysisResult(result);
    setIsAnalysisLoading(false);
  }

  async function handleSaveAnalysis(): Promise<void> {
    if (!analysisResult || isSaving) return;
    setIsSaving(true);
    setSaveMessage("");

    const timestamp = new Date().toLocaleString("en-IN");
    const saved = await saveProjectionAnalysis({
      analysis_name: `${analysisResult.project_name} · ${analysisResult.scenario_code.toUpperCase()} · ${timestamp}`,
      result: analysisResult,
    });

    if (saved) {
      analytics.savedAnalysis(
        analysisResult.project_name,
        analysisResult.scenario_code,
        saved.analysis_id,
      );
      setSaveMessage("Analysis saved successfully.");
      const refreshed = await fetchSavedAnalyses();
      setSavedAnalyses(refreshed);
    } else {
      setSaveMessage("Unable to save analysis. Please try again.");
    }

    setIsSaving(false);
  }

  function handleExportJson(): void {
    if (!analysisResult) return;
    analytics.exportedJson(analysisResult.project_name, analysisResult.scenario_code);
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
    if (!analysisResult || !selectedProject) return;
    analytics.exportedCsv(analysisResult.project_name, analysisResult.scenario_code);
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

  async function handleOpenSavedAnalysis(
    analysisId: string,
    analysisName: string,
  ): Promise<void> {
    setOpeningAnalysisId(analysisId);
    analytics.openedSavedAnalysis(analysisId, analysisName);
    const detail = await fetchSavedAnalysisById(analysisId);
    if (detail) {
      setReopenedAnalysis(detail);
      // Scroll up so the user sees the results immediately
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setOpeningAnalysisId(null);
  }

  function handleClearReopenedAnalysis(): void {
    setReopenedAnalysis(null);
  }

  function handleToggleCompare(analysisId: string): void {
    setCompareIds((prev) => {
      if (prev.includes(analysisId)) {
        return prev.filter((id) => id !== analysisId);
      }
      if (prev.length >= 2) {
        // Drop the oldest selection and add the new one
        return [prev[1], analysisId];
      }
      return [...prev, analysisId];
    });
  }

  async function handleRunCompare(): Promise<void> {
    if (compareIds.length !== 2) return;
    setIsLoadingCompare(true);
    analytics.comparedSavedAnalyses(compareIds[0], compareIds[1]);

    const [a, b] = await Promise.all([
      fetchSavedAnalysisById(compareIds[0]),
      fetchSavedAnalysisById(compareIds[1]),
    ]);

    if (a && b) {
      setCompareDetails([a, b]);
      // Scroll to top so user can see the comparison appear
      setTimeout(() => {
        document.getElementById("compare-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }

    setIsLoadingCompare(false);
  }

  function handleCloseCompare(): void {
    setCompareDetails(null);
    setCompareIds([]);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10">
      {/* ── 1. Project search ─────────────────────────────────────────────── */}
      <ProjectSearchPanel
        cities={cities}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
      />

      {/* ── 2. Main workspace grid ────────────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column: scenario, results, input cards */}
        <div className="space-y-6">
          {/* Scenario selector */}
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenarioCode={selectedScenarioCode}
            onChange={handleScenarioChange}
          />

          {/* Reopened-analysis banner */}
          {reopenedAnalysis ? (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-slate-100 px-5 py-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Viewing saved analysis
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-950">
                  {reopenedAnalysis.analysis_name}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {reopenedAnalysis.project_name} ·{" "}
                  {reopenedAnalysis.scenario_code.toUpperCase()} ·{" "}
                  {new Date(reopenedAnalysis.created_at).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearReopenedAnalysis}
                className="flex-shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          ) : null}

          {/* Results (current run OR reopened saved analysis) */}
          <CurrentFairPriceResults
            result={resultToDisplay}
            isLoading={isAnalysisLoading}
          />

          {/* Input group cards */}
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

        {/* Right sidebar */}
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          {/* ── Analysis controls card ─────────────────────────────────── */}
          <div className="overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 shadow-md">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Workspace
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                  Project
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedProject?.project_name ?? (
                    <span className="text-slate-500">No project selected</span>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                  Scenario
                </div>
                <div className="text-sm font-semibold text-white">
                  {selectedScenario?.scenario_name ?? (
                    <span className="text-slate-500">None</span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatPill
                  label="Stage"
                  value={formValues.project_stage || "—"}
                />
                <StatPill
                  label="Benchmark"
                  value={
                    formValues.benchmark_current_asking_price
                      ? `₹${Number(formValues.benchmark_current_asking_price).toLocaleString("en-IN")}`
                      : "—"
                  }
                />
              </div>
            </div>

            {/* Live result summary (only after analysis runs) */}
            {analysisResult ? (
              <div className="border-b border-white/10 px-6 py-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Latest run
                </div>
                <div className="mt-3 grid gap-3">
                  <div className="rounded-2xl bg-white/8 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Fair price
                    </div>
                    <div className="mt-1.5 text-lg font-semibold text-white">
                      ₹{analysisResult.current_fair_price_psf.toLocaleString("en-IN")}
                      <span className="ml-1 text-sm font-normal text-slate-400">/ sq ft</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/8 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        5Y projection
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-white">
                        ₹{
                          analysisResult.selected_scenario_projection_points
                            .find((p) => p.year === 5)
                            ?.projected_price_psf.toLocaleString("en-IN") ?? "N/A"
                        }
                        <span className="ml-1 text-xs font-normal text-slate-400">/ sq ft</span>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/8 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Confidence
                      </div>
                      <div className="mt-1.5 text-sm font-semibold text-white">
                        {analysisResult.confidence_score.toFixed(1)}
                        <span className="ml-0.5 text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Top sensitivity driver
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-white">
                      {analysisResult.top_sensitivity_driver}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Primary action */}
            <div className="px-6 py-5">
              <button
                type="button"
                onClick={() => void handleRunAnalysis()}
                disabled={isAnalysisLoading || !selectedProject}
                className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalysisLoading
                  ? "Running analysis…"
                  : analysisResult
                    ? "Re-run analysis"
                    : "Run fair price, projection and sensitivity analysis"}
              </button>

              {/* Secondary actions */}
              {analysisResult ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveAnalysis()}
                    disabled={isSaving}
                    className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExportCsv()}
                    className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    CSV
                  </button>
                </div>
              ) : null}

              {/* Status / feedback message */}
              {saveMessage ? (
                <div className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-xs leading-5 text-slate-200">
                  {saveMessage}
                </div>
              ) : null}
            </div>
          </div>

          {/* ── Saved analyses panel ───────────────────────────────────── */}
          <SavedAnalysisPanel
            savedAnalyses={savedAnalyses}
            openingAnalysisId={openingAnalysisId}
            activeAnalysisId={reopenedAnalysis?.analysis_id ?? null}
            compareIds={compareIds}
            onOpenAnalysis={(id, name) => void handleOpenSavedAnalysis(id, name)}
            onClearActiveAnalysis={handleClearReopenedAnalysis}
            onToggleCompare={handleToggleCompare}
            onRunCompare={() => void handleRunCompare()}
            isLoadingCompare={isLoadingCompare}
          />
        </aside>
      </div>

      {/* ── 3. Compare section (full width, shown only when compare is active) ── */}
      {compareDetails ? (
        <div id="compare-section">
          <CompareRunsSection
            analysisA={compareDetails[0]}
            analysisB={compareDetails[1]}
            onClose={handleCloseCompare}
          />
        </div>
      ) : null}
    </div>
  );
}
