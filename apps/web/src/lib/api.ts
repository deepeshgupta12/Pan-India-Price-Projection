import { City } from "@/types/city";
import { HealthResponse } from "@/types/health";
import {
  PricingAnalysisRequest,
  PricingAnalysisResponse,
  ProjectionAnalysisResponse,
  SaveAnalysisRequest,
  SavedAnalysisDetailResponse,
  SavedAnalysisListItem,
} from "@/types/pricing";
import { Project } from "@/types/project";
import { ScenarioProfile } from "@/types/scenario-profile";
import { VariableDefinition } from "@/types/variable-definition";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000";

async function fetchFromApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    return null;
  }
}

async function postToApi<TRequest, TResponse>(
  path: string,
  payload: TRequest,
): Promise<TResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    console.error(`Failed to post ${path}:`, error);
    return null;
  }
}

async function postTextToApi<TRequest>(
  path: string,
  payload: TRequest,
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`Failed to post text ${path}:`, error);
    return null;
  }
}

export async function fetchApiHealth(): Promise<HealthResponse | null> {
  return fetchFromApi<HealthResponse>("/api/v1/health");
}

export async function fetchCities(): Promise<City[]> {
  return (await fetchFromApi<City[]>("/api/v1/dictionaries/cities")) ?? [];
}

export async function fetchProjects(params?: {
  cityId?: number;
  query?: string;
  limit?: number;
}): Promise<Project[]> {
  const searchParams = new URLSearchParams();

  if (params?.cityId) {
    searchParams.set("city_id", String(params.cityId));
  }

  if (params?.query) {
    searchParams.set("q", params.query);
  }

  searchParams.set("limit", String(params?.limit ?? 50));

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    (await fetchFromApi<Project[]>(`/api/v1/dictionaries/projects${suffix}`)) ??
    []
  );
}

export async function fetchVariableDefinitions(): Promise<VariableDefinition[]> {
  return (
    (await fetchFromApi<VariableDefinition[]>(
      "/api/v1/dictionaries/variable-definitions",
    )) ?? []
  );
}

export async function fetchScenarioProfiles(): Promise<ScenarioProfile[]> {
  return (
    (await fetchFromApi<ScenarioProfile[]>(
      "/api/v1/dictionaries/scenario-profiles",
    )) ?? []
  );
}

export async function runCurrentFairPriceAnalysis(
  payload: PricingAnalysisRequest,
): Promise<PricingAnalysisResponse | null> {
  return postToApi<PricingAnalysisRequest, PricingAnalysisResponse>(
    "/api/v1/pricing/current-fair-price",
    payload,
  );
}

export async function runProjectionSummaryAnalysis(
  payload: PricingAnalysisRequest,
): Promise<ProjectionAnalysisResponse | null> {
  return postToApi<PricingAnalysisRequest, ProjectionAnalysisResponse>(
    "/api/v1/pricing/projection-summary",
    payload,
  );
}

export async function saveProjectionAnalysis(
  payload: SaveAnalysisRequest,
): Promise<SavedAnalysisDetailResponse | null> {
  return postToApi<SaveAnalysisRequest, SavedAnalysisDetailResponse>(
    "/api/v1/pricing/save-analysis",
    payload,
  );
}

export async function fetchSavedAnalyses(): Promise<SavedAnalysisListItem[]> {
  return (
    (await fetchFromApi<SavedAnalysisListItem[]>(
      "/api/v1/pricing/saved-analyses",
    )) ?? []
  );
}

export async function fetchSavedAnalysisById(
  analysisId: string,
): Promise<SavedAnalysisDetailResponse | null> {
  return fetchFromApi<SavedAnalysisDetailResponse>(
    `/api/v1/pricing/saved-analyses/${analysisId}`,
  );
}

export async function exportProjectionAnalysisCsv(
  payload: PricingAnalysisRequest,
): Promise<string | null> {
  return postTextToApi<PricingAnalysisRequest>(
    "/api/v1/pricing/export-csv",
    payload,
  );
}