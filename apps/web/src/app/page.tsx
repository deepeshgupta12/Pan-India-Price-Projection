import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { VariableGlossaryCard } from "@/components/glossary/variable-glossary-card";
import { InputGroupOverview } from "@/components/inputs/input-group-overview";
import { ProjectSearchPanel } from "@/components/search/project-search-panel";
import { InfoCard } from "@/components/ui/info-card";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import {
  fetchApiHealth,
  fetchCities,
  fetchProjects,
  fetchVariableDefinitions,
} from "@/lib/api";

const inputGroups = [
  {
    title: "Project basics",
    description:
      "Identity and structural details of the subject project that help anchor the baseline analysis.",
    fields: [
      "Project name",
      "City",
      "Micromarket",
      "Locality",
      "Developer",
      "Project stage",
      "Launch date",
      "Expected possession date",
    ],
  },
  {
    title: "Product and configuration",
    description:
      "Physical and product-level variables that affect quality premium, density, and marketability.",
    fields: [
      "Land parcel",
      "Total units",
      "Towers",
      "Floors",
      "Average unit size",
      "Unit mix",
      "Parking ratio",
      "Open space %",
      "Amenity score",
    ],
  },
  {
    title: "Market and benchmarks",
    description:
      "Comparable and market context variables that influence current fair asking price.",
    fields: [
      "Locality asking price",
      "Micromarket asking price",
      "Ready-to-move price",
      "Resale price",
      "Average rent",
      "Rental yield",
      "Inventory overhang",
      "Absorption",
    ],
  },
  {
    title: "Connectivity and infrastructure",
    description:
      "Variables related to transit access, job corridors, and upcoming infrastructure-led uplift.",
    fields: [
      "Distance to metro",
      "Distance to job hub",
      "Road access",
      "Social infra score",
      "Upcoming infra records",
      "Infra impact timing",
      "Infra confidence",
    ],
  },
];

export default async function HomePage() {
  const [health, cities, projects, variableDefinitions] = await Promise.all([
    fetchApiHealth(),
    fetchCities(),
    fetchProjects({ limit: 100 }),
    fetchVariableDefinitions(),
  ]);

  return (
    <AppShell>
      <div className="space-y-10">
        <PageHeader
          eyebrow="Step 5 · Search-first input shell"
          title="PAN India real estate asking price projection workspace"
          description="Search and select a project, inspect structured project metadata, and understand how each variable will be represented in the product. Every input will carry visible meaning, placeholder guidance, example usage, and formula relevance."
          actions={
            <div className="flex flex-wrap gap-3">
              <StatPill label="Backend" value={health ? "Connected" : "Unavailable"} />
              <StatPill label="Cities loaded" value={String(cities.length)} />
              <StatPill label="Projects loaded" value={String(projects.length)} />
              <StatPill
                label="Variables loaded"
                value={String(variableDefinitions.length)}
              />
            </div>
          }
        />

        <SectionCard
          title="Search-first project dictionary workflow"
          subtitle="This is the first real product interaction layer. Users can begin with project search, then move into variable-led editing and future projection analysis."
        >
          <ProjectSearchPanel cities={cities} projects={projects} />
        </SectionCard>

        <SectionCard
          title="Frozen input architecture"
          subtitle="The editable analysis form will be built around grouped input cards so users understand what each block represents."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {inputGroups.map((group) => (
              <InputGroupOverview
                key={group.title}
                title={group.title}
                description={group.description}
                fields={group.fields}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Variable glossary preview"
          subtitle="Every input, dropdown, and placeholder must be explainable. This glossary view is the base for that requirement."
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
          subtitle="The next step will begin converting this information shell into a real editable analysis experience."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              title="Editable input cards"
              description="We will render user-editable fields from the variable dictionary instead of relying on hardcoded field descriptions."
            />
            <InfoCard
              title="Project prefill"
              description="Selecting a project will prefill the input state so the user can edit assumptions rather than start from scratch."
            />
            <InfoCard
              title="Scenario base"
              description="We will start wiring scenario profiles and calculation-ready state for bear, base, bull, and custom assumptions."
            />
            <InfoCard
              title="Analysis workflow"
              description="The page will evolve from browse-only mode into a real projection workspace with form sections and action controls."
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}