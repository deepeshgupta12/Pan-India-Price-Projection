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
          eyebrow="Step 9 · Sensitivity layer and richer interpretability"
          title="PAN India real estate asking price projection workspace"
          description="The workspace now adds sensitivity scenarios, richer narrative interpretation, risk flags, confidence framing, and improved chart readability on top of the forward projection engine."
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
          subtitle="Project selection, editable assumptions, fair price output, forward projections, and sensitivity interpretation now work together as a richer decision-support experience."
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
          subtitle="The next step will move into save/export flows and broader output polish."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Save analysis"
              description="We will begin persisting analysis state so users can revisit project runs."
            />
            <InfoCard
              title="Export flows"
              description="We will start introducing export-ready analysis outputs and downloadable artifacts."
            />
            <InfoCard
              title="Workflow polish"
              description="We will improve chart readability, output continuity, and interaction quality across the page."
            />
            <InfoCard
              title="Interpretation depth"
              description="We will continue sharpening narrative explanation so the model is easier to trust and act on."
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}