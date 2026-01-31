"use client";

import type { AdMetricsSummaryDto } from "@/lib/api";

interface AdMetricsChartProps {
  metrics: AdMetricsSummaryDto;
  onClose: () => void;
}

// T149: Ad metrics chart component
export function AdMetricsChart({ metrics, onClose }: AdMetricsChartProps) {
  const dailyMetrics = metrics.dailyMetrics || [];
  const maxImpressions = Math.max(...dailyMetrics.map((d) => d.impressions ?? 0), 1);
  const maxClicks = Math.max(...dailyMetrics.map((d) => d.clicks ?? 0), 1);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-4xl">
        <div className="p-6 border-b border-muted/20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-surface-light">
              สถิติโฆษณา
            </h2>
            {metrics.title && (
              <p className="text-muted mt-1">{metrics.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-surface-light transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-dark rounded-xl p-4 border border-muted/20">
              <p className="text-muted text-sm">Total Impressions</p>
              <p className="text-2xl font-bold text-surface-light mt-1">
                {(metrics.totalImpressions ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-dark rounded-xl p-4 border border-muted/20">
              <p className="text-muted text-sm">Total Clicks</p>
              <p className="text-2xl font-bold text-surface-light mt-1">
                {(metrics.totalClicks ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-dark rounded-xl p-4 border border-muted/20">
              <p className="text-muted text-sm">Click-Through Rate</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {(metrics.clickThroughRate ?? 0).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Daily Chart */}
          <div>
            <h3 className="text-surface-light font-medium mb-4">รายวัน (30 วันล่าสุด)</h3>

            {dailyMetrics.length > 0 ? (
              <div className="space-y-6">
                {/* Impressions Chart */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm text-muted">Impressions</span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {dailyMetrics.map((day) => (
                      <div
                        key={day.date}
                        className="flex-1 group relative"
                        title={`${formatDate(day.date)}: ${(day.impressions ?? 0).toLocaleString()} impressions`}
                      >
                        <div
                          className="bg-primary/60 hover:bg-primary transition-colors rounded-t"
                          style={{
                            height: `${((day.impressions ?? 0) / maxImpressions) * 100}%`,
                            minHeight: (day.impressions ?? 0) > 0 ? "4px" : "0",
                          }}
                        />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-dark text-xs text-surface-light rounded whitespace-nowrap z-10">
                          {formatDate(day.date)}: {(day.impressions ?? 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clicks Chart */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-accent rounded-full" />
                    <span className="text-sm text-muted">Clicks</span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {dailyMetrics.map((day) => (
                      <div
                        key={day.date}
                        className="flex-1 group relative"
                        title={`${formatDate(day.date)}: ${(day.clicks ?? 0).toLocaleString()} clicks`}
                      >
                        <div
                          className="bg-accent/60 hover:bg-accent transition-colors rounded-t"
                          style={{
                            height: `${((day.clicks ?? 0) / maxClicks) * 100}%`,
                            minHeight: (day.clicks ?? 0) > 0 ? "4px" : "0",
                          }}
                        />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-dark text-xs text-surface-light rounded whitespace-nowrap z-10">
                          {formatDate(day.date)}: {(day.clicks ?? 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date labels */}
                <div className="flex justify-between text-xs text-muted">
                  {dailyMetrics.length > 0 && (
                    <>
                      <span>{formatDate(dailyMetrics[0].date)}</span>
                      <span>{formatDate(dailyMetrics[dailyMetrics.length - 1].date)}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted">
                ยังไม่มีข้อมูลสถิติ
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-muted/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark text-surface-light font-medium rounded-xl hover:bg-dark/80 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
