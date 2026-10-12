import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from "ng-apexcharts";
import {
  Analytics,
  AnalyticsDistributionPayload,
  AnalyticsKpiPayload,
  AnalyticsRankingPayload,
  AnalyticsResponse,
  AnalyticsTablePayload,
  AnalyticsTimeSeriesPayload,
  DistributionBucket,
  MetricEntry,
  RankingEntry,
  TableColumn,
  TimeSeriesPoint,
} from "../../core/model/home-dashboard/home-dashboard.model";

export interface ChartView {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  labels: string[];
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  grid: ApexGrid;
}

export type KpiTone = "warning" | "danger";

export interface KpiMetricView {
  key: string;
  label: string;
  value: string;
  icon: string;
  tone?: KpiTone;
  badge?: string;
}

export interface TableView {
  columns: { key: string; label: string; numeric: boolean }[];
  rows: string[][];
}

export type RenderItem = { id: string; displayName: string } & (
  | { kind: "kpi"; subtitle?: string; metrics: KpiMetricView[]; hiddenAlerts: number }
  | { kind: "chart"; wide: boolean; view: ChartView }
  | ({ kind: "table" } & TableView)
  | { kind: "empty" }
);

type Payload = NonNullable<Analytics["payload"]>;
type BlockType = NonNullable<Analytics["analyticsType"]>;

const PALETTE = [
  "#203340",
  "#8fabbf",
  "#97a9a0",
  "#e0c080",
  "#5f737f",
  "#8fc19f",
  "#d08080",
  "#b7c4cc",
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#8fc19f",
  MEDIUM: "#e0c080",
  HIGH: "#d08080",
};

export const KPI_VISIBLE_LIMIT = 4;

const DONUT_MAX_BUCKETS = 5;
const COMPOSITION_BLOCKS: BlockType[] = ["OCCUR_ANONYMITY"];
const DEFAULT_KPI_ICON = "bi-bar-chart-line";

const ALERT_TONES: Record<string, KpiTone> = {
  awaitingReport: "warning",
  awaitingClose: "warning",
  awaitingRating: "warning",
  pendingEditApproval: "warning",
  withoutFormAssigned: "warning",
  highPriority: "danger",
  lowRated: "danger",
};

const ALERT_BADGES: Record<KpiTone, string> = {
  warning: "Pendente",
  danger: "Atenção",
};

const KPI_ICONS: Record<string, string> = {
  totalUsers: "bi-people",
  activeUsers: "bi-person-check",
  disabledUsers: "bi-person-slash",
  totalDepartments: "bi-diagram-3",
  activeDepartments: "bi-diagram-3-fill",
  totalOccurTypes: "bi-tags",
  activeOccurTypes: "bi-tags-fill",
  totalOccurs: "bi-clipboard-data",
  draftOpened: "bi-pencil-square",
  awaitingReport: "bi-hourglass-split",
  awaitingClose: "bi-hourglass-bottom",
  awaitingRating: "bi-star-half",
  closed: "bi-check-circle",
  pendingEditApproval: "bi-patch-question",
  withRncOpened: "bi-exclamation-octagon",
  withRncLinked: "bi-link-45deg",
  avgHoursToClose: "bi-stopwatch",
  minHoursToClose: "bi-lightning-charge",
  maxHoursToClose: "bi-hourglass-bottom",
  totalClosed: "bi-check2-all",
  avgRateScore: "bi-star-fill",
  totalRated: "bi-chat-square-text",
  highRated: "bi-hand-thumbs-up",
  lowRated: "bi-hand-thumbs-down",
  closedWithRating: "bi-check2-square",
  closedWithoutRating: "bi-dash-square",
  totalRncs: "bi-file-earmark-x",
  opened: "bi-folder2-open",
  workInProgress: "bi-gear",
  withFormAssigned: "bi-journal-check",
  withoutFormAssigned: "bi-journal-x",
  totalForms: "bi-journal-text",
  totalReported: "bi-megaphone",
  highPriority: "bi-exclamation-triangle",
};

const BASE_CHART = {
  fontFamily: "inherit",
  toolbar: { show: false },
} satisfies Partial<ApexChart>;

const numberFormat = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined || Number.isNaN(value)
    ? "-"
    : numberFormat.format(value);
}

export function buildRenderItems(
  response: AnalyticsResponse | null | undefined
): RenderItem[] {
  const items: RenderItem[] = [];

  for (const block of response?.analytics ?? []) {
    const item = mapBlock(block);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

function mapBlock(block: Analytics): RenderItem | null {
  const payload = block.payload;
  if (!payload) {
    return null;
  }

  const id = block.analyticsType ?? block.displayName ?? "";
  const displayName = block.displayName ?? id;
  const type = block.analyticsType;

  if (isKpi(payload)) {
    const metrics = payload.metrics ?? [];
    return type && COMPOSITION_BLOCKS.includes(type)
      ? compositionItem(id, displayName, metrics)
      : kpiItem(id, displayName, metrics);
  }

  if (isDistribution(payload)) {
    return distributionItem(id, displayName, payload.buckets ?? []);
  }

  if (isTimeSeries(payload)) {
    return timeSeriesItem(id, displayName, payload);
  }

  if (isRanking(payload)) {
    return rankingItem(id, displayName, payload.entries ?? []);
  }

  if (isTable(payload)) {
    return tableItem(id, displayName, payload);
  }

  return null;
}

function isKpi(payload: Payload): payload is AnalyticsKpiPayload {
  return "metrics" in payload && Array.isArray(payload.metrics);
}

function isDistribution(payload: Payload): payload is AnalyticsDistributionPayload {
  return "buckets" in payload && Array.isArray(payload.buckets);
}

function isTimeSeries(payload: Payload): payload is AnalyticsTimeSeriesPayload {
  return "points" in payload && Array.isArray(payload.points);
}

function isRanking(payload: Payload): payload is AnalyticsRankingPayload {
  return "entries" in payload && Array.isArray(payload.entries);
}

function isTable(payload: Payload): payload is AnalyticsTablePayload {
  return "columns" in payload && Array.isArray(payload.columns);
}

/* ---------------------------------------------------------------- KPI */

function kpiItem(
  id: string,
  displayName: string,
  metrics: MetricEntry[],
  subtitle?: string
): RenderItem {
  const views = metrics.map(toKpiMetric);

  return {
    id,
    displayName,
    kind: "kpi",
    subtitle,
    metrics: views,
    hiddenAlerts: views.slice(KPI_VISIBLE_LIMIT).filter((m) => m.tone).length,
  };
}

function toKpiMetric(metric: MetricEntry): KpiMetricView {
  const key = metric.key ?? "";
  const tone = (metric.value ?? 0) > 0 ? ALERT_TONES[key] : undefined;

  return {
    key,
    label: metricLabel(metric),
    value: formatMetricValue(metric),
    icon: KPI_ICONS[key] ?? DEFAULT_KPI_ICON,
    tone,
    badge: tone && ALERT_BADGES[tone],
  };
}

function metricLabel(metric: MetricEntry): string {
  return metric.label ?? humanize(metric.key ?? "");
}

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatMetricValue(metric: MetricEntry): string {
  const formatted = formatNumber(metric.value);
  const isDuration = /^(avg|min|max)Hours/.test(metric.key ?? "");

  return isDuration && metric.value !== null && metric.value !== undefined
    ? `${formatted} h`
    : formatted;
}

/* ------------------------------------------------------- DISTRIBUTION */

function compositionItem(
  id: string,
  displayName: string,
  metrics: MetricEntry[]
): RenderItem {
  const values = metrics.map((m) => m.value ?? 0);

  if (sum(values) === 0) {
    return { id, displayName, kind: "empty" };
  }

  return {
    id,
    displayName,
    kind: "chart",
    wide: false,
    view: donutChart(metrics.map(metricLabel), values, PALETTE),
  };
}

function distributionItem(
  id: string,
  displayName: string,
  buckets: DistributionBucket[]
): RenderItem {
  const values = buckets.map((b) => b.value ?? 0);

  if (buckets.length === 0 || sum(values) === 0) {
    return { id, displayName, kind: "empty" };
  }

  const labels = buckets.map((b) => b.label ?? b.key ?? "");

  if (buckets.length <= DONUT_MAX_BUCKETS) {
    return {
      id,
      displayName,
      kind: "chart",
      wide: false,
      view: donutChart(labels, values, bucketColors(buckets)),
    };
  }

  const ordered = labels
    .map((label, index) => ({ label, value: values[index] }))
    .sort((a, b) => b.value - a.value);

  return {
    id,
    displayName,
    kind: "chart",
    wide: false,
    view: horizontalBars(
      ordered.map((o) => o.label),
      [{ name: displayName, data: ordered.map((o) => o.value) }],
      { distributed: true }
    ),
  };
}

function bucketColors(buckets: DistributionBucket[]): string[] {
  const byPriority = buckets.every(
    (b) => b.key !== undefined && b.key in PRIORITY_COLORS
  );

  return byPriority
    ? buckets.map((b) => PRIORITY_COLORS[b.key as string])
    : PALETTE;
}

/* ---------------------------------------------------------- TIMELINE */

function timeSeriesItem(
  id: string,
  displayName: string,
  payload: AnalyticsTimeSeriesPayload
): RenderItem {
  const points = payload.points ?? [];

  if (points.length === 0) {
    return { id, displayName, kind: "empty" };
  }

  return {
    id,
    displayName,
    kind: "chart",
    wide: true,
    view: timeSeriesChart(points, payload.granularity ?? "DAY"),
  };
}

function timeSeriesChart(
  points: TimeSeriesPoint[],
  granularity: AnalyticsTimeSeriesPayload.GranularityEnum
): ChartView {
  const labelsByKey = new Map<string, string>();
  for (const point of points) {
    for (const metric of point.metrics ?? []) {
      if (metric.key && !labelsByKey.has(metric.key)) {
        labelsByKey.set(metric.key, metricLabel(metric));
      }
    }
  }

  const series = Array.from(labelsByKey, ([key, name]) => ({
    name,
    data: points.map(
      (p) => p.metrics?.find((m) => m.key === key)?.value ?? 0
    ),
  }));

  const categories = points.map((p) => formatDate(p.date, granularity));
  const scale = axisScale(series.flatMap((s) => s.data));
  const asColumns = granularity === "MONTH" || points.length < 3;

  return chartView({
    series,
    colors: PALETTE,
    chart: {
      ...BASE_CHART,
      type: asColumns ? "bar" : "area",
      height: 300,
      zoom: { enabled: false },
    },
    stroke: asColumns ? { show: false } : { curve: "smooth", width: 2 },
    fill: asColumns
      ? { opacity: 1 }
      : {
          type: "gradient",
          gradient: { opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
        },
    plotOptions: asColumns
      ? { bar: { columnWidth: "40%", borderRadius: 4 } }
      : {},
    xaxis: { categories },
    yaxis: {
      min: 0,
      ...scale,
      labels: { formatter: (value: number) => formatNumber(value) },
    },
    legend: { position: "top", horizontalAlign: "right" },
    tooltip: { y: { formatter: (value: number) => formatNumber(value) } },
  });
}

function formatDate(raw: string | undefined, granularity: string): string {
  const [year, month, day] = (raw ?? "").split("-");

  if (!year || !month) {
    return raw ?? "";
  }

  return granularity === "MONTH" ? `${month}/${year}` : `${day}/${month}`;
}

/* ----------------------------------------------------------- RANKING */

function rankingItem(
  id: string,
  displayName: string,
  entries: RankingEntry[]
): RenderItem {
  if (entries.length === 0) {
    return { id, displayName, kind: "empty" };
  }

  if (entries.length === 1) {
    const [entry] = entries;
    return kpiItem(id, displayName, entry.metrics ?? [], entry.name);
  }

  const { keys, stacked } = rankingSeriesKeys(entries);
  const labelsByKey = new Map<string, string>();
  for (const metric of entries.flatMap((e) => e.metrics ?? [])) {
    if (metric.key && !labelsByKey.has(metric.key)) {
      labelsByKey.set(metric.key, metricLabel(metric));
    }
  }

  const ordered = [...entries].sort(
    (a, b) => metricValue(b, keys[0]) - metricValue(a, keys[0])
  );

  return {
    id,
    displayName,
    kind: "chart",
    wide: false,
    view: horizontalBars(
      ordered.map((e) => e.name ?? ""),
      keys.map((key) => ({
        name: labelsByKey.get(key) ?? humanize(key),
        data: ordered.map((e) => metricValue(e, key)),
      })),
      { stacked }
    ),
  };
}

function rankingSeriesKeys(entries: RankingEntry[]): {
  keys: string[];
  stacked: boolean;
} {
  const keys = Array.from(
    new Set(
      entries.flatMap((e) => (e.metrics ?? []).map((m) => m.key ?? ""))
    )
  ).filter((key) => key && !key.startsWith("avg"));

  return keys.includes("closed") && keys.includes("open")
    ? { keys: ["closed", "open"], stacked: true }
    : { keys, stacked: false };
}

function metricValue(entry: RankingEntry, key: string): number {
  return entry.metrics?.find((m) => m.key === key)?.value ?? 0;
}

/* ------------------------------------------------------------- TABLE */

function tableItem(
  id: string,
  displayName: string,
  payload: AnalyticsTablePayload
): RenderItem {
  const rows = payload.rows ?? [];

  if (rows.length === 0) {
    return { id, displayName, kind: "empty" };
  }

  const columns = (payload.columns ?? []).map((column) => ({
    key: column.key ?? "",
    label: column.label ?? "",
    type: column.dataType,
  }));

  return {
    id,
    displayName,
    kind: "table",
    columns: columns.map(({ key, label, type }) => ({
      key,
      label,
      numeric: type === "NUMBER",
    })),
    rows: rows.map((row) =>
      columns.map((column) => formatCell(row[column.key], column.type))
    ),
  };
}

function formatCell(
  value: unknown,
  type: TableColumn.DataTypeEnum | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  switch (type) {
    case "NUMBER":
      return formatNumber(Number(value));
    case "BOOLEAN":
      return value ? "Sim" : "Não";
    case "DATE": {
      const [year, month, day] = String(value).split("-");
      return day ? `${day}/${month}/${year}` : String(value);
    }
    case "DATETIME":
      return new Date(String(value)).toLocaleString("pt-BR");
    default:
      return String(value);
  }
}

/* ------------------------------------------------------------ CHARTS */

function chartView(
  view: Pick<ChartView, "series" | "chart" | "colors"> & Partial<ChartView>
): ChartView {
  return {
    labels: [],
    xaxis: {},
    yaxis: {},
    plotOptions: {},
    dataLabels: { enabled: false },
    stroke: {},
    fill: {},
    legend: {},
    tooltip: {},
    grid: { borderColor: "#e9ecef" },
    ...view,
  };
}

function donutChart(labels: string[], values: number[], colors: string[]): ChartView {
  return chartView({
    series: values,
    labels,
    colors,
    chart: { ...BASE_CHART, type: "donut", height: 300 },
    legend: { position: "bottom" },
    tooltip: { y: { formatter: (value: number) => formatNumber(value) } },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            value: { formatter: (value: string) => formatNumber(Number(value)) },
            total: {
              show: true,
              label: "Total",
              formatter: () => formatNumber(sum(values)),
            },
          },
        },
      },
    },
  });
}

function horizontalBars(
  categories: string[],
  series: ApexAxisChartSeries,
  options: { stacked?: boolean; distributed?: boolean }
): ChartView {
  const values = series.flatMap((s) => s.data as number[]);
  const multiSeries = series.length > 1;

  return chartView({
    series,
    colors: PALETTE,
    chart: {
      ...BASE_CHART,
      type: "bar",
      stacked: options.stacked ?? false,
      height: Math.max(300, categories.length * 40 + (multiSeries ? 90 : 50)),
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "62%",
        distributed: options.distributed ?? false,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value: number) => formatNumber(value),
    },
    xaxis: {
      categories,
      ...axisScale(options.stacked ? stackedTotals(series) : values),
      labels: { formatter: (value: string) => formatNumber(Number(value)) },
    },
    legend: { show: multiSeries, position: "bottom" },
    tooltip: { y: { formatter: (value: number) => formatNumber(value) } },
  });
}

function stackedTotals(series: ApexAxisChartSeries): number[] {
  const length = Math.max(...series.map((s) => s.data.length));

  return Array.from({ length }, (_, index) =>
    sum(series.map((s) => Number(s.data[index] ?? 0)))
  );
}

function axisScale(values: number[]): { decimalsInFloat: number; tickAmount?: number } {
  const integers = values.every((value) => Number.isInteger(value));

  return integers
    ? {
        decimalsInFloat: 0,
        tickAmount: Math.min(Math.max(1, ...values), 5),
      }
    : { decimalsInFloat: 2 };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
