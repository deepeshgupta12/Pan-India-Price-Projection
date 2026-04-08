"use client";

import { SavedAnalysisListItem } from "@/types/pricing";

type SavedAnalysisPanelProps = {
  savedAnalyses: SavedAnalysisListItem[];
  openingAnalysisId: string | null;
  activeAnalysisId: string | null;
  compareIds: string[];
  onOpenAnalysis: (analysisId: string, analysisName: string) => void;
  onClearActiveAnalysis: () => void;
  onToggleCompare: (analysisId: string) => void;
  onRunCompare: () => void;
  isLoadingCompare: boolean;
};

export function SavedAnalysisPanel({
  savedAnalyses,
  openingAnalysisId,
  activeAnalysisId,
  compareIds,
  onOpenAnalysis,
  onClearActiveAnalysis,
  onToggleCompare,
  onRunCompare,
  isLoadingCompare,
}: SavedAnalysisPanelProps) {
  const canCompare = compareIds.length === 2;
  const hasActive = Boolean(activeAnalysisId);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div>
          <div className="text-sm font-semibold text-slate-950">Saved analyses</div>
          <div className="mt-0.5 text-xs text-slate-500">
            {savedAnalyses.length} {savedAnalyses.length === 1 ? "snapshot" : "snapshots"}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {hasActive ? (
            <button
              type="button"
              onClick={onClearActiveAnalysis}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              ← Back to workspace
            </button>
          ) : null}

          {canCompare ? (
            <button
              type="button"
              onClick={onRunCompare}
              disabled={isLoadingCompare}
              className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isLoadingCompare ? "Loading..." : "Compare 2 selected →"}
            </button>
          ) : compareIds.length === 1 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
              Select 1 more to compare
            </div>
          ) : null}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {savedAnalyses.length > 0 ? (
          savedAnalyses.slice(0, 10).map((item) => {
            const isCompareSelected = compareIds.includes(item.analysis_id);
            const isOpening = openingAnalysisId === item.analysis_id;
            const isActive = activeAnalysisId === item.analysis_id;

            return (
              <div
                key={item.analysis_id}
                className={`px-5 py-4 transition ${
                  isActive ? "bg-slate-950/[0.03]" : "hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Compare checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleCompare(item.analysis_id)}
                    aria-label={
                      isCompareSelected
                        ? "Remove from comparison"
                        : "Add to comparison"
                    }
                    className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                      isCompareSelected
                        ? "border-slate-950 bg-slate-950"
                        : "border-slate-300 bg-white hover:border-slate-600"
                    }`}
                  >
                    {isCompareSelected ? (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        viewBox="0 0 10 10"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    ) : null}
                  </button>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold leading-5 text-slate-950">
                        {item.analysis_name}
                      </div>
                      {isActive ? (
                        <span className="flex-shrink-0 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">
                      {item.project_name} ·{" "}
                      <span className="font-medium uppercase">
                        {item.scenario_code}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {new Date(item.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Open button */}
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenAnalysis(item.analysis_id, item.analysis_name)
                      }
                      disabled={isOpening}
                      className="flex-shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-950 disabled:opacity-60"
                    >
                      {isOpening ? "..." : "Open"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-sm text-slate-500">No saved analyses yet.</div>
            <div className="mt-1 text-xs text-slate-400">
              Run an analysis and click Save to create a snapshot.
            </div>
          </div>
        )}
      </div>

      {/* Compare help text */}
      {savedAnalyses.length >= 2 && compareIds.length === 0 ? (
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="text-xs leading-5 text-slate-400">
            Check the boxes on any two runs to compare them side by side.
          </p>
        </div>
      ) : null}
    </div>
  );
}
