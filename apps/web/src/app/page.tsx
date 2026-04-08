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
          eyebrow="Step 7 · Pricing API + current fair price results"
          title="PAN India real estate asking price projection workspace"
          description="The workspace now supports the first real analysis loop: select a project, edit assumptions, run the backend pricing engine, and view current fair asking price output with factor-level explanation."
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
          subtitle="Project selection, editable assumptions, scenario selection, and current fair price calculation now work together as the first full analysis loop."
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
          subtitle="The next step will build on this baseline engine and introduce future projection windows and charted outputs."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="1Y / 3Y / 5Y projections"
              description="We will extend the backend engine from current fair price into forward-looking scenario projections."
            />
            <InfoCard
              title="Scenario-linked growth logic"
              description="Bear, base, and bull profiles will start influencing projected price movement over time."
            />
            <InfoCard
              title="Charts"
              description="We will introduce visual outputs for scenario comparison and projected price movement."
            />
            <InfoCard
              title="Richer explanation"
              description="The pricing explanation layer will expand into more detailed factor interpretation and confidence framing."
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}