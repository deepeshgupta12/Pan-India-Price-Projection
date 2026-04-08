"use client";

import { useMemo, useState } from "react";

import { City } from "@/types/city";
import { Project } from "@/types/project";
import { ProjectCard } from "@/components/search/project-card";

type ProjectSearchPanelProps = {
  cities: City[];
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (projectId: number) => void;
};

export function ProjectSearchPanel({
  cities,
  projects,
  selectedProjectId,
  onSelectProject,
}: ProjectSearchPanelProps) {
  const [selectedCityId, setSelectedCityId] = useState<number | "all">("all");
  const [query, setQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCity =
        selectedCityId === "all" || project.city_id === selectedCityId;

      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        project.project_name.toLowerCase().includes(normalizedQuery) ||
        (project.address_text ?? "").toLowerCase().includes(normalizedQuery);

      return matchesCity && matchesQuery;
    });
  }, [projects, query, selectedCityId]);

  const selectedProject =
    filteredProjects.find((project) => project.id === selectedProjectId) ??
    projects.find((project) => project.id === selectedProjectId) ??
    null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <label className="text-sm font-semibold text-slate-900">
            Filter by city
          </label>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Narrow the project dictionary by city before choosing a subject
            project.
          </p>
          <select
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
            value={selectedCityId}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedCityId(value === "all" ? "all" : Number(value));
            }}
          >
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.city_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Search project
          </label>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Search by project name or address. This is the first step of the
            search-first workflow.
          </p>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Gurgaon, Whitefield, Dwarka Expressway"
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="block w-full text-left"
              >
                <ProjectCard
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                />
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-600">
              No projects matched the selected city filter and search query.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Selected subject project
          </div>

          {selectedProject ? (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  {selectedProject.project_name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedProject.address_text ?? "Address not available"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Stage
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {selectedProject.project_stage ?? "Not available"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Benchmark asking price
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {selectedProject.benchmark_current_asking_price
                      ? `₹${selectedProject.benchmark_current_asking_price.toLocaleString("en-IN")} / sq ft`
                      : "Not available"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Average unit size
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {selectedProject.avg_unit_size_sqft
                      ? `${selectedProject.avg_unit_size_sqft.toLocaleString("en-IN")} sq ft`
                      : "Not available"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total units
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-950">
                    {selectedProject.total_units?.toLocaleString("en-IN") ??
                      "Not available"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
                Selecting a project now prefills the editable analysis form
                below. This will become the base for pricing and projection
                logic in the next steps.
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
              Select a project to continue into the future pricing workflow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}