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
          eyebrow="Step 8 · Forward projection engine and visual output layer"
          title="PAN India real estate asking price projection workspace"
          description="The workspace now supports current fair value analysis, 1Y / 3Y / 5Y projections, scenario comparison, and visual output charts. This step extends the pricing engine into forward-looking analysis."
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
          subtitle="Project selection, editable assumptions, scenario selection, current fair price output, and forward projections now work together as a richer analysis loop."
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
          subtitle="The next step will deepen interpretability and move toward sensitivity, save/export, and further output polish."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Sensitivity engine"
              description="We will show how changes in assumptions influence fair price and future projection outputs."
            />
            <InfoCard
              title="Deeper explanation"
              description="We will expand pricing reasoning and confidence logic to make the model more interpretable."
            />
            <InfoCard
              title="Save and export"
              description="We will start introducing saveable analysis state and export-ready outputs."
            />
            <InfoCard
              title="Dashboard polish"
              description="We will improve result discoverability, CTA states, and continuity across the workflow."
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}