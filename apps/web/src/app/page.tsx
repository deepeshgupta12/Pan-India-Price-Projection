import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { InfoCard } from "@/components/ui/info-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { fetchApiHealth } from "@/lib/api";

export default async function HomePage() {
  const health = await fetchApiHealth();

  return (
    <AppShell>
      <div className="space-y-10">
        <PageHeader
          eyebrow="Foundation Setup"
          title="PAN India real estate asking price projection workspace"
          description="This product will estimate current fair asking price, future projections, factor contributions, infrastructure impact, and scenario-based price movement for residential primary-market projects across Indian cities."
          actions={
            <div className="flex flex-wrap gap-3">
              <StatPill
                label="Frontend"
                value="Next.js foundation ready"
              />
              <StatPill
                label="Backend"
                value={health ? "Connected" : "Unavailable"}
              />
            </div>
          }
        />

        <SectionCard
          title="System health and implementation base"
          subtitle="This page is the initial product shell. Later steps will convert it into the full analysis workflow with dictionaries, input groups, graphs, comparable projects, glossary views, and scenario outputs."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Backend API status"
              description={
                health
                  ? `Connected to ${health.app_name} (${health.version}) in ${health.environment} mode.`
                  : "Backend is not reachable right now. Start the FastAPI server to restore connectivity."
              }
            />
            <InfoCard
              title="Project dictionary"
              description="Will support project-led search, standardised prefill, city-micromarket-locality mapping, and editable project attributes."
            />
            <InfoCard
              title="Variable dictionary"
              description="Every input will have meaning, help text, placeholders, validation, formula dependency, and business interpretation visible in the UI."
            />
            <InfoCard
              title="Infrastructure engine"
              description="Upcoming infrastructure will be modeled as a structured impact layer with timing, distance, probability, status, and weighted uplift contribution."
            />
          </div>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SectionCard
              title="Frozen V1 scope"
              subtitle="The frontend build will progressively implement these modules as we move step by step."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard
                  title="Input experience"
                  description="Search-first and manual workflows, grouped cards, helper text for each field, and dictionary-driven forms."
                />
                <InfoCard
                  title="Output experience"
                  description="Beautiful cards, comparable project tables, fair price range, scenario projections, risk and confidence indicators."
                />
                <InfoCard
                  title="Analytics layer"
                  description="Factor contributions, sensitivity analysis, infrastructure impact decomposition, and scenario comparison."
                />
                <InfoCard
                  title="Export and save"
                  description="Save analysis snapshots locally and support export flows as the product matures."
                />
              </div>
            </SectionCard>
          </div>

          <div>
            <SectionCard
              title="Next implementation milestones"
              subtitle="This panel mirrors our scoped build path."
            >
              <div className="space-y-4">
                <InfoCard
                  title="Step 3"
                  description="Database foundation, SQLAlchemy setup, seed models, and core schema definitions."
                />
                <InfoCard
                  title="Step 4"
                  description="Dictionary APIs for cities, micromarkets, localities, projects, developers, and variable metadata."
                />
                <InfoCard
                  title="Step 5"
                  description="Frontend search flow, manual analysis form, tooltip-ready variable cards, and glossary rendering."
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}