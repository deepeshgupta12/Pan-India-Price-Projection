"use client";

import { useEffect, useMemo, useState } from "react";

import { analytics } from "@/lib/analytics";
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

  // Fire search analytics event on query or city filter change (debounced by
  // the render cycle — no extra debounce needed at V1 volume).
  useEffect(() => {
    if (query.trim().length > 0 || selectedCityId !== "all") {
      analytics.searchedProject(query.trim(), filteredProjects.length);
    }
  }, [query, selectedCityId, filteredProjects.length]);

  const selectedProject =
    filteredProjects.find((p) => p.id === selectedProjectId) ??
    projects.find((p) => p.id === selectedProjectId) ??
    null;

  return (
    <div className="space-y-6">
      {/* ── Search controls ──────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <label className="text-sm font-semibold text-slate-900">
            Filter by city
          </label>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Narrow the project dictionary by city before choosing a subject
            project.
          </p>
          <select
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-0"
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
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Search by project name or address. This is the starting point for
            the pricing workflow.
          </p>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Whitefield, Dwarka Expressway, Bandra…"
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-0"
          />
        </div>
      </div>

      {/* ── Project list + selected project card ─────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Project list */}
        <div className="space-y-3">
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
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm leading-6 text-slate-500">
              No projects match the selected city filter and search query.
            </div>
          )}
        </div>

        {/* Selected project summary */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Subject project
          </div>

          {selectedProject ? (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xl font-semibold leading-7 text-slate-950">
                  {selectedProject.project_name}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  {selectedProject.address_text ?? "Address not available"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Stage
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-950">
                    {selectedProject.project_stage ?? "—"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Benchmark asking price
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-950">
                    {selectedProject.benchmark_current_asking_price
                      ? `₹${selectedProject.benchmark_current_asking_price.toLocaleString("en-IN")} / sq ft`
                      : "—"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Avg unit size
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-950">
                    {selectedProject.avg_unit_size_sqft
                      ? `${selectedProject.avg_unit_size_sqft.toLocaleString("en-IN")} sq ft`
                      : "—"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Total units
                  </div>
                  <div className="mt-1.5 text-sm font-semibold text-slate-950">
                    {selectedProject.total_units?.toLocaleString("en-IN") ?? "—"}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
                Selecting a project prefills the analysis form below with its
                dictionary record. You can edit any field before running.
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm leading-6 text-slate-500">
              Select a project from the list to begin the pricing workflow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
