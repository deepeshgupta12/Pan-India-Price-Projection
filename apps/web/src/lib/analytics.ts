/**
 * Analytics module — V1 lightweight event instrumentation layer.
 *
 * In V1 all events are logged to the console in non-production environments.
 * Swap the `trackEvent` implementation to forward events to PostHog, Segment,
 * Amplitude, or any other analytics provider without touching call-sites.
 */

type AnalyticsEventName =
  | "searched_project"
  | "selected_project"
  | "changed_scenario"
  | "edited_input"
  | "ran_analysis"
  | "saved_analysis"
  | "exported_json"
  | "exported_csv"
  | "opened_saved_analysis"
  | "compared_saved_analyses";

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

function trackEvent(name: AnalyticsEventName, payload?: AnalyticsPayload): void {
  const entry: AnalyticsPayload & { event: string; ts: string } = {
    event: name,
    ts: new Date().toISOString(),
    ...payload,
  };

  // Development console visibility
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", entry);
  }

  // TODO: Forward to analytics provider
  // Example: window.posthog?.capture(name, payload);
  // Example: window.analytics?.track(name, payload);
}

export const analytics = {
  /**
   * Fired when the user types into the project search input.
   * @param query - the current search query string
   * @param resultsCount - number of matching projects shown
   */
  searchedProject(query: string, resultsCount: number): void {
    trackEvent("searched_project", { query, results_count: resultsCount });
  },

  /**
   * Fired when the user clicks a project to select it.
   */
  selectedProject(projectId: number, projectName: string): void {
    trackEvent("selected_project", { project_id: projectId, project_name: projectName });
  },

  /**
   * Fired when the user changes the active scenario profile.
   */
  changedScenario(scenarioCode: string, scenarioName: string): void {
    trackEvent("changed_scenario", { scenario_code: scenarioCode, scenario_name: scenarioName });
  },

  /**
   * Fired when any editable input field value changes.
   */
  editedInput(fieldKey: string): void {
    trackEvent("edited_input", { field_key: fieldKey });
  },

  /**
   * Fired when the user triggers a full analysis run.
   */
  ranAnalysis(projectName: string, scenarioCode: string): void {
    trackEvent("ran_analysis", { project_name: projectName, scenario_code: scenarioCode });
  },

  /**
   * Fired when an analysis is successfully saved.
   */
  savedAnalysis(projectName: string, scenarioCode: string, analysisId: string): void {
    trackEvent("saved_analysis", {
      project_name: projectName,
      scenario_code: scenarioCode,
      analysis_id: analysisId,
    });
  },

  /**
   * Fired when the user exports the result as JSON.
   */
  exportedJson(projectName: string, scenarioCode: string): void {
    trackEvent("exported_json", { project_name: projectName, scenario_code: scenarioCode });
  },

  /**
   * Fired when the user exports the result as CSV.
   */
  exportedCsv(projectName: string, scenarioCode: string): void {
    trackEvent("exported_csv", { project_name: projectName, scenario_code: scenarioCode });
  },

  /**
   * Fired when the user opens a saved analysis to view its result.
   */
  openedSavedAnalysis(analysisId: string, analysisName: string): void {
    trackEvent("opened_saved_analysis", { analysis_id: analysisId, analysis_name: analysisName });
  },

  /**
   * Fired when the user launches a side-by-side comparison of two saved analyses.
   */
  comparedSavedAnalyses(analysisIdA: string, analysisIdB: string): void {
    trackEvent("compared_saved_analyses", {
      analysis_id_a: analysisIdA,
      analysis_id_b: analysisIdB,
    });
  },
};
