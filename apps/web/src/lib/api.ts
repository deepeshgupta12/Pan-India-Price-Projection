import { HealthResponse } from "@/types/health";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:9000";

export async function fetchApiHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Health API failed with status ${response.status}`);
    }

    return (await response.json()) as HealthResponse;
  } catch (error) {
    console.error("Failed to fetch API health:", error);
    return null;
  }
}