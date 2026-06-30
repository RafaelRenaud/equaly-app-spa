import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Occur } from '../../../../core/model/occur/occur.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurAutoRefreshService } from '../../../../core/service/occur/occur-auto-refresh.service';
import { OccurService } from '../../../../core/service/occur/occur.service';
import { OccurComplementViewerComponent } from "../main-viewer/occur-complement-viewer/occur-complement-viewer.component";
import { OccurMainViewerComponent } from "../main-viewer/occur-main-viewer/occur-main-viewer.component";

@Component({
  selector: "app-occur-viewer",
  imports: [
    OccurMainViewerComponent,
    OccurComplementViewerComponent,
    NgbNavModule
  ],
  templateUrl: "./occur-viewer.component.html",
  styleUrl: "./occur-viewer.component.scss",
  standalone: true,
})
export class OccurViewerComponent implements OnInit, OnDestroy {
  public occur: Occur | null = null;
  private subscriptions: Subscription[] = [];
  private occurId: number = 0;

  constructor(
    private occurService: OccurService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private autoRefresh: OccurAutoRefreshService,
  ) { }

  ngOnInit() {
    this.loadingService.show();

    const occurIdParam = this.route.snapshot.paramMap.get("id");

    if (!occurIdParam) {
      this.handleError("ID da Ocorrência Inválido");
      return;
    }

    this.occurId = Number(occurIdParam);

    if (isNaN(this.occurId)) {
      this.handleError("ID da Ocorrência Inválido");
      return;
    }

    this.loadOccur();

    this.subscriptions.push(
      this.autoRefresh.refresh$.subscribe(() => {
        this.loadOccurSilently();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadOccur(): void {
    this.occurService
      .getOccur(this.occurId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (occur) => {
          if (occur) {
            this.occur = occur;
          } else {
            this.handleError("Ocorrência não encontrada");
          }
        },
        error: () => this.handleError("Ocorrência Inválida"),
      });
  }

  private loadOccurSilently(): void {
    this.loadingService.show();

    this.occurService
      .getOccur(this.occurId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (occur) => {
          if (occur) {
            this.occur = occur;
          }
        },
        error: () => console.error("Erro ao recarregar ocorrência"),
      });
  }

  private handleError(message: string) {
    this.loadingService.hide();
    setTimeout(() => {
      this.router.navigate(["/occurs"], {
        queryParams: { action: "ERROR", message },
      });
    }, 100);
  }
}