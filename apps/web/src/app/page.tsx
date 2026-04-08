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
        {/* ── Page header ──────────────────────────────────────────────── */}
        <PageHeader
          eyebrow="Step 11 complete · Analytics · Saved runs · Compare · Polish"
          title="PAN India real estate asking price projection workspace"
          description="Search any project, configure assumptions, run fair price and forward projection analysis, save snapshots, and compare runs side by side — all in one workspace."
          actions={
            <div className="flex flex-wrap gap-3">
              <StatPill
                label="Backend"
                value={health ? "Connected" : "Unavailable"}
              />
              <StatPill label="Cities" value={String(cities.length)} />
              <StatPill label="Projects" value={String(projects.length)} />
              <StatPill
                label="Variables"
                value={String(variableDefinitions.length)}
              />
              <StatPill label="Scenarios" value={String(scenarios.length)} />
            </div>
          }
        />

        {/* ── Workspace ────────────────────────────────────────────────── */}
        <SectionCard
          title="Analysis workspace"
          subtitle="Select a project, adjust scenario and input assumptions, run the pricing and projection engine, then save or export your result. Use the saved-analyses panel to reopen any previous run or compare two runs side by side."
        >
          <AnalysisWorkspace
            cities={cities}
            projects={projects}
            scenarios={scenarios}
          />
        </SectionCard>

        {/* ── Variable glossary ─────────────────────────────────────────── */}
        <SectionCard
          title="Variable glossary"
          subtitle="Every input variable is documented with its definition, unit, acceptable range, and formula impact so analysts can interpret any result with full context."
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
              description="The backend variable dictionary did not return any records. Confirm the seed migration has run successfully."
            />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
