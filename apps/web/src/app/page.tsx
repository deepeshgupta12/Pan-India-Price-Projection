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
          eyebrow="Step 6 · Editable analysis workspace"
          title="PAN India real estate asking price projection workspace"
          description="Search a project, prefill analysis inputs, edit assumptions, and prepare the scenario-ready state that the pricing engine will use next. This step establishes the editable workflow foundation for the product."
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
          subtitle="Project selection now drives editable analysis state. This is the form layer that will feed the fair-price and future-projection engines."
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
                <VariableGlossaryCard
                  key={variable.id}
                  variable={variable}
                />
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
          subtitle="The next step will introduce real pricing logic and current fair asking price output."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Current fair price engine"
              description="We will compute a baseline asking price using benchmark, product, and risk-linked inputs."
            />
            <InfoCard
              title="Scenario-linked preview"
              description="Selected scenario profiles will begin affecting the calculated output rather than just form state."
            />
            <InfoCard
              title="Output cards"
              description="We will introduce result cards for fair price, pricing range, and early explanation blocks."
            />
            <InfoCard
              title="Computation layer"
              description="The first analysis engine module will connect backend calculations with the editable frontend state."
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}