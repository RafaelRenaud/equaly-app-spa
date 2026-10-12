import { DatePipe, NgTemplateOutlet } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbAccordionModule } from "@ng-bootstrap/ng-bootstrap";
import { NgApexchartsModule } from "ng-apexcharts";
import { AnalyticsResponse } from "../../core/model/home-dashboard/home-dashboard.model";
import { HomeService } from "../../core/service/home/home.service";
import { LoadingService } from "../../core/service/loading/loading.service";
import { SessionService } from "../../core/service/session/session.service";
import { buildRenderItems, KPI_VISIBLE_LIMIT, RenderItem } from "./home-render-items";

@Component({
  selector: "app-home",
  imports: [NgApexchartsModule, NgbAccordionModule, NgTemplateOutlet, DatePipe],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
  private static readonly CACHE_DATA_KEY = "homeAnalyticsData";
  private static readonly CACHE_EXPIRES_KEY = "homeAnalyticsDataExpiresAt";

  userNickname: string | null = null;
  companyName: string | null = null;
  generatedAt: Date | null = null;
  readonly kpiCollapsedLimit = KPI_VISIBLE_LIMIT;
  renderItems: RenderItem[] = [];
  hasData = false;
  hasError = false;
  allEmpty = false;

  constructor(
    private sessionService: SessionService,
    private homeService: HomeService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.userNickname = this.sessionService.getItem("nickname");
    this.companyName = this.sessionService.getItem("companyName");
    this.loadFromCacheOrFetch();
  }

  private loadFromCacheOrFetch(): void {
    const cached = this.readValidCache();

    if (cached) {
      this.applyResponse(cached);
      return;
    }

    this.loadAnalytics();
  }

  private readValidCache(): AnalyticsResponse | null {
    const rawExpires = this.sessionService.getItem(HomeComponent.CACHE_EXPIRES_KEY);
    const rawData = this.sessionService.getItem(HomeComponent.CACHE_DATA_KEY);

    if (!rawExpires || !rawData) return null;

    const expiresAt = this.parseTimestamp(rawExpires);
    if (expiresAt === null) return null;
    if (Date.now() >= expiresAt) return null;

    try {
      const parsed = JSON.parse(rawData) as AnalyticsResponse;
      if (!parsed || !Array.isArray(parsed.analytics)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private parseTimestamp(raw: string): number | null {
    const asNumber = Number(raw);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      return asNumber;
    }

    const asDate = new Date(raw).getTime();
    if (!Number.isNaN(asDate)) {
      return asDate;
    }

    return null;
  }

  loadAnalytics(): void {
    this.loadingService.show();
    this.hasError = false;

    this.homeService.getAnalytics().subscribe({
      next: (response: AnalyticsResponse) => {
        this.persistAndApply(response);
        this.loadingService.hide();
      },
      error: () => {
        this.renderItems = [];
        this.hasData = false;
        this.allEmpty = false;
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
        this.persistAndApply(response);
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

  private persistAndApply(response: AnalyticsResponse): void {
    this.sessionService.saveHomescreenData(response);
    this.applyResponse(response);
  }

  private applyResponse(response: AnalyticsResponse): void {
    this.renderItems = buildRenderItems(response);
    this.hasData = this.renderItems.length > 0;
    this.allEmpty = this.hasData && this.renderItems.every((item) => item.kind === "empty");
    this.hasError = false;
    this.generatedAt = response?.generatedAt ? new Date(response.generatedAt) : null;
  }
}
