import { AnalysisWorkspace } from "@/components/analysis/analysis-workspace";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { VariableGlossaryCard } from "@/components/glossary/variable-glossary-card";
import { InfoCard } from "@/components/ui/info-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import {
  fetchApiHealth,
  fetchCities,
  fetchProjects,
  fetchScenarioProfiles,
  fetchVariableDefinitions,
} from "@/lib/api";

export default async function HomePage() {
  const [health, cities, projects, variableDefinitions, scenarios] =
    await Promise.all([
      fetchApiHealth(),
      fetchCities(),
      fetchProjects({ limit: 100 }),
      fetchVariableDefinitions(),
      fetchScenarioProfiles(),
    ]);

  return (
    <AppShell>
      <div className="space-y-10">
        <PageHeader
          eyebrow="Step 10 · Save/export flows and broader dashboard polish"
          title="PAN India real estate asking price projection workspace"
          description="The workspace now supports saveable analysis runs, JSON and CSV exports, improved right-rail continuity, and saved analysis visibility alongside pricing, projections, and sensitivity outputs."
          actions={
            <div className="flex flex-wrap gap-3">
              <StatPill label="Backend" value={health ? "Connected" : "Unavailable"} />
              <StatPill label="Cities" value={String(cities.length)} />
              <StatPill label="Projects" value={String(projects.length)} />
              <StatPill label="Variables" value={String(variableDefinitions.length)} />
              <StatPill label="Scenarios" value={String(scenarios.length)} />
            </div>
          }
        />

        <SectionCard
          title="Editable analysis workflow"
          subtitle="Project selection, editable assumptions, pricing outputs, forward projections, sensitivity interpretation, and save/export actions now work together as a fuller decision-support experience."
        >
          <AnalysisWorkspace
            cities={cities}
            projects={projects}
            scenarios={scenarios}
          />
        </SectionCard>

        <SectionCard
          title="Variable glossary"
          subtitle="Glossary visibility remains intact so every important input can still be interpreted with context."
        >
          {variableDefinitions.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {variableDefinitions.map((variable) => (
                <VariableGlossaryCard key={variable.id} variable={variable} />
              ))}
            </div>
          ) : (
            <InfoCard
              title="No variable definitions loaded"
              description="The backend variable dictionary did not return any records."
            />
          )}
        </SectionCard>

        <SectionCard
          title="What comes next"
          subtitle="The next step can extend this product into deeper persistence, comparison workflows, and event instrumentation."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Saved analysis detail views"
              description="We can add richer revisit flows where saved analyses reopen directly into the workspace."
            />
            <InfoCard
              title="Compare saved runs"
              description="We can support comparison of the same project across scenarios and assumption sets."
            />
            <InfoCard
              title="Analytics instrumentation"
              description="We can begin wiring tracked events for analysis runs, saves, exports, and scenario changes."
            />
            <InfoCard
              title="Output polish"
              description="We can further refine dashboard hierarchy, saved-state continuity, and richer export packaging."
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}