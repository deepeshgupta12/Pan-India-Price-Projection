import { AnalysisFieldConfig, AnalysisFormValues } from "@/types/analysis-form";
import { Project } from "@/types/project";

export const analysisInputGroups: Array<{
  title: string;
  description: string;
  fields: AnalysisFieldConfig[];
}> = [
  {
    title: "Project basics",
    description:
      "Core identity and timeline fields that anchor the subject project before calculations begin.",
    fields: [
      {
        key: "project_name",
        label: "Project name",
        placeholder: "e.g. Sample Gurgaon Launch One",
        helpText: "Name of the project being analyzed.",
        inputType: "text",
      },
      {
        key: "project_stage",
        label: "Project stage",
        placeholder: "e.g. New Launch",
        helpText: "Launch stage affects risk and pricing premium assumptions.",
        inputType: "text",
      },
      {
        key: "launch_date",
        label: "Launch date",
        placeholder: "YYYY-MM-DD",
        helpText: "Project launch timing influences time-based comparisons.",
        inputType: "date",
      },
      {
        key: "expected_possession_date",
        label: "Expected possession date",
        placeholder: "YYYY-MM-DD",
        helpText: "Possession timing influences stage discount and buyer confidence.",
        inputType: "date",
      },
    ],
  },
  {
    title: "Product and configuration",
    description:
      "Physical and product-level inputs that influence quality premium, density, and usability.",
    fields: [
      {
        key: "total_land_acres",
        label: "Total land area",
        placeholder: "e.g. 12.5",
        helpText: "Total site area for the project.",
        inputType: "number",
        unit: "acres",
      },
      {
        key: "total_units",
        label: "Total units",
        placeholder: "e.g. 950",
        helpText: "Number of units in the project.",
        inputType: "number",
      },
      {
        key: "towers_count",
        label: "Towers count",
        placeholder: "e.g. 7",
        helpText: "Number of residential towers in the project.",
        inputType: "number",
      },
      {
        key: "floors_count",
        label: "Floors count",
        placeholder: "e.g. 34",
        helpText: "Average or representative tower height.",
        inputType: "number",
      },
      {
        key: "avg_unit_size_sqft",
        label: "Average unit size",
        placeholder: "e.g. 1850",
        helpText: "Typical average saleable or built-up unit size used for analysis.",
        inputType: "number",
        unit: "sq ft",
      },
      {
        key: "density_units_per_acre",
        label: "Density",
        placeholder: "e.g. 76",
        helpText: "Units per acre. Higher density may affect perceived premium.",
        inputType: "number",
        unit: "units/acre",
      },
      {
        key: "parking_ratio",
        label: "Parking ratio",
        placeholder: "e.g. 1.7",
        helpText: "Parking slots per unit or equivalent ratio.",
        inputType: "number",
      },
      {
        key: "open_space_pct",
        label: "Open space percentage",
        placeholder: "e.g. 68",
        helpText: "Share of open area in the overall project.",
        inputType: "number",
        unit: "%",
      },
      {
        key: "amenity_score",
        label: "Amenity score",
        placeholder: "e.g. 8.4",
        helpText: "Composite score for amenities and lifestyle offering.",
        inputType: "number",
        unit: "score",
      },
      {
        key: "construction_quality_score",
        label: "Construction quality score",
        placeholder: "e.g. 8.8",
        helpText: "Composite score for material quality and build standards.",
        inputType: "number",
        unit: "score",
      },
      {
        key: "legal_clarity_score",
        label: "Legal clarity score",
        placeholder: "e.g. 8.5",
        helpText: "Represents legal confidence and documentation clarity.",
        inputType: "number",
        unit: "score",
      },
    ],
  },
  {
    title: "Market and benchmark context",
    description:
      "Market-facing variables that shape fair asking price benchmarking and current positioning.",
    fields: [
      {
        key: "benchmark_current_asking_price",
        label: "Benchmark asking price",
        placeholder: "e.g. 18250",
        helpText: "Comparable or market benchmark asking price used as baseline.",
        inputType: "number",
        unit: "₹/sq ft",
      },
      {
        key: "benchmark_radius_km",
        label: "Benchmark radius",
        placeholder: "e.g. 3",
        helpText: "Comparable search radius used for benchmark construction.",
        inputType: "number",
        unit: "km",
      },
      {
        key: "avg_rent",
        label: "Average rent",
        placeholder: "e.g. 42000",
        helpText: "Representative rent benchmark for the local market.",
        inputType: "number",
        unit: "₹/month",
      },
      {
        key: "inventory_overhang_months",
        label: "Inventory overhang",
        placeholder: "e.g. 18",
        helpText: "Months required to absorb existing supply at current sales pace.",
        inputType: "number",
        unit: "months",
      },
    ],
  },
  {
    title: "Connectivity and infrastructure",
    description:
      "Key accessibility and infrastructure-driven variables that will later feed the projection model.",
    fields: [
      {
        key: "distance_to_metro_km",
        label: "Distance to nearest metro",
        placeholder: "e.g. 1.8",
        helpText: "Road distance from the project to the nearest metro station.",
        inputType: "number",
        unit: "km",
      },
      {
        key: "social_infra_score",
        label: "Social infra score",
        placeholder: "e.g. 7.1",
        helpText: "Composite score for schools, hospitals, malls, and daily-use ecosystem.",
        inputType: "number",
        unit: "score",
      },
    ],
  },
];

export function buildInitialAnalysisFormValues(): AnalysisFormValues {
  return {
    project_name: "",
    city_id: null,
    micromarket_id: null,
    locality_id: null,
    project_stage: "",
    launch_date: "",
    expected_possession_date: "",

    total_land_acres: "",
    total_units: "",
    towers_count: "",
    floors_count: "",
    avg_unit_size_sqft: "",
    density_units_per_acre: "",
    parking_ratio: "",
    open_space_pct: "",
    amenity_score: "",
    construction_quality_score: "",
    legal_clarity_score: "",

    benchmark_current_asking_price: "",
    benchmark_radius_km: "",
    avg_rent: "",
    inventory_overhang_months: "",
    distance_to_metro_km: "",
    social_infra_score: "",
  };
}

function toStringValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

export function buildAnalysisFormValuesFromProject(
  project: Project,
): AnalysisFormValues {
  return {
    project_name: project.project_name ?? "",
    city_id: project.city_id ?? null,
    micromarket_id: project.micromarket_id ?? null,
    locality_id: project.locality_id ?? null,
    project_stage: project.project_stage ?? "",
    launch_date: project.launch_date ?? "",
    expected_possession_date: project.expected_possession_date ?? "",

    total_land_acres: toStringValue(project.total_land_acres),
    total_units: toStringValue(project.total_units),
    towers_count: toStringValue(project.towers_count),
    floors_count: toStringValue(project.floors_count),
    avg_unit_size_sqft: toStringValue(project.avg_unit_size_sqft),
    density_units_per_acre: toStringValue(project.density_units_per_acre),
    parking_ratio: toStringValue(project.parking_ratio),
    open_space_pct: toStringValue(project.open_space_pct),
    amenity_score: toStringValue(project.amenity_score),
    construction_quality_score: toStringValue(project.construction_quality_score),
    legal_clarity_score: toStringValue(project.legal_clarity_score),

    benchmark_current_asking_price: toStringValue(
      project.benchmark_current_asking_price,
    ),
    benchmark_radius_km: toStringValue(project.benchmark_radius_km),
    avg_rent: "",
    inventory_overhang_months: "",
    distance_to_metro_km: "",
    social_infra_score: "",
  };
}