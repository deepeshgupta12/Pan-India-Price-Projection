"use client";

import { useEffect, useMemo, useState } from "react";

import {
  analysisInputGroups,
  buildAnalysisFormValuesFromProject,
  buildInitialAnalysisFormValues,
} from "@/lib/analysis-form";
import { City } from "@/types/city";
import { AnalysisFormValues } from "@/types/analysis-form";
import { Project } from "@/types/project";
import { ScenarioProfile } from "@/types/scenario-profile";
import { ProjectSearchPanel } from "@/components/search/project-search-panel";
import { ScenarioSelector } from "@/components/analysis/scenario-selector";
import { AnalysisGroupCard } from "@/components/analysis/analysis-group-card";
import { StatPill } from "@/components/ui/stat-pill";

type AnalysisWorkspaceProps = {
  cities: City[];
  projects: Project[];
  scenarios: ScenarioProfile[];
};

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
  const [formValues, setFormValues] = useState<AnalysisFormValues>(
    buildInitialAnalysisFormValues(),
  );

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? null;

  useEffect(() => {
    if (selectedProject) {
      setFormValues(buildAnalysisFormValuesFromProject(selectedProject));
    }
  }, [selectedProject]);

  const selectedScenario = useMemo(
    () =>
      scenarios.find(
        (scenario) => scenario.scenario_code === selectedScenarioCode,
      ) ?? null,
    [scenarios, selectedScenarioCode],
  );

  function handleFieldChange(
    key: keyof AnalysisFormValues,
    value: string,
  ): void {
    setFormValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  return (
    <div className="space-y-10">
      <ProjectSearchPanel
        cities={cities}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ScenarioSelector
            scenarios={scenarios}
            selectedScenarioCode={selectedScenarioCode}
            onChange={setSelectedScenarioCode}
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

        <aside className="space-y-6">
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

              <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200">
                This summary panel will later show current fair asking price,
                factor contribution, confidence score, and scenario-ready
                calculation outputs.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-950">
              Prefill logic
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              When a project is selected, the analysis form is automatically
              initialized from that project’s dictionary record. The user can
              then edit assumptions before calculations are introduced.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}