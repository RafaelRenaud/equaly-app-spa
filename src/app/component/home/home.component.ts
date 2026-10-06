import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApexChart, NgApexchartsModule } from "ng-apexcharts";
import {
  Analytics,
  AnalyticsResponse,
} from "../../core/model/home-dashboard/home-dashboard.model";
import { HomeService } from "../../core/service/home/home.service";
import { LoadingService } from "../../core/service/loading/loading.service";
import { SessionService } from "../../core/service/session/session.service";

type RenderItem =
  | { kind: "kpi"; displayName: string; metrics: { key: string; value: number }[] }
  | { kind: "chart"; displayName: string; series: any; chart: ApexChart; labels?: string[]; xaxis?: any }
  | { kind: "table"; displayName: string; columns: { key: string; label: string }[]; rows: any[] };

@Component({
  selector: "app-home",
  imports: [NgApexchartsModule, DatePipe],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
  userNickname: string | null = null;
  companyName: string | null = null;
  generatedAt: Date | null = null;
  renderItems: RenderItem[] = [];
  hasData = false;
  hasError = false;
  idle = true;

  constructor(
    private sessionService: SessionService,
    private homeService: HomeService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.userNickname = this.sessionService.getItem("nickname");
    this.companyName = this.sessionService.getItem("companyName");
  }

  openDashboard(): void {
    this.idle = false;
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loadingService.show();
    this.hasError = false;
    this.homeService.getAnalytics().subscribe({
      next: (response: AnalyticsResponse) => {
        this.applyResponse(response);
        this.loadingService.hide();
      },
      error: () => {
        this.renderItems = [];
        this.hasData = false;
        this.hasError = true;
        this.loadingService.hide();
      },
    });
  }

  reloadAnalytics(): void {
    this.loadingService.show();
    this.hasError = false;
    this.homeService.reloadAnalytics().subscribe({
      next: (response: AnalyticsResponse) => {
        this.applyResponse(response);
        this.loadingService.hide();
      },
      error: () => {
        this.hasError = true;
        this.loadingService.hide();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao recarregar página inicial, tente novamente mais tarde.",
          },
        });
      },
    });
  }

  private applyResponse(response: AnalyticsResponse): void {
    this.renderItems = this.buildRenderItems(response);
    this.hasData = this.renderItems.length > 0;
    this.hasError = false;
    this.generatedAt = response?.generatedAt ? new Date(response.generatedAt) : null;
  }

  private buildRenderItems(response: AnalyticsResponse): RenderItem[] {
    const blocks = (response?.analytics ?? []) as unknown as Analytics[];
    const items: RenderItem[] = [];
    for (const block of blocks) {
      const item = this.mapToRenderItem(block);
      if (item) items.push(item);
    }
    return items;
  }

  private mapToRenderItem(block: Analytics): RenderItem | null {
    const type = block.analyticsType as string;
    const display = block.displayName ?? type;
    const payload = block.payload as any;
    if (!payload) return null;

    if (Array.isArray(payload.metrics)) {
      return { kind: "kpi", displayName: display, metrics: payload.metrics };
    }

    if (Array.isArray(payload.buckets)) {
      return {
        kind: "chart",
        displayName: display,
        chart: { type: "pie", height: 280, toolbar: { show: false }, fontFamily: "inherit" },
        labels: payload.buckets.map((b: any) => b.label ?? b.key),
        series: payload.buckets.map((b: any) => b.value ?? 0),
      };
    }

    if (Array.isArray(payload.points)) {
      return {
        kind: "chart",
        displayName: display,
        chart: { type: "area", height: 280, toolbar: { show: false }, fontFamily: "inherit" },
        series: this.buildTimeSeries(payload.points),
        xaxis: { categories: payload.points.map((p: any) => p.date) },
      };
    }

    if (Array.isArray(payload.entries)) {
      const firstMetricKey = payload.entries[0]?.metrics?.[0]?.key ?? "value";
      return {
        kind: "chart",
        displayName: display,
        chart: { type: "bar", height: 280, toolbar: { show: false }, fontFamily: "inherit" },
        series: [
          {
            name: firstMetricKey,
            data: payload.entries.map((e: any) => e.metrics?.[0]?.value ?? 0),
          },
        ],
        xaxis: { categories: payload.entries.map((e: any) => e.name ?? "") },
      };
    }

    if (Array.isArray(payload.columns) && Array.isArray(payload.rows)) {
      return {
        kind: "table",
        displayName: display,
        columns: payload.columns.map((c: any) => ({ key: c.key, label: c.label })),
        rows: payload.rows,
      };
    }

    return null;
  }

  private buildTimeSeries(points: any[]): any[] {
    if (!points.length) return [];
    const metricKeys = new Set<string>();
    points.forEach((p) =>
      (p.metrics ?? []).forEach((m: any) => metricKeys.add(m.key))
    );
    return Array.from(metricKeys).map((key) => ({
      name: key,
      data: points.map((p) => {
        const metric = (p.metrics ?? []).find((m: any) => m.key === key);
        return metric?.value ?? 0;
      }),
    }));
  }

  formatMetricKey(key: string): string {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim();
  }
}