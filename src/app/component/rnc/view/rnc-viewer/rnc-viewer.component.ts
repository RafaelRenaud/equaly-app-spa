// rnc-viewer.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Occur } from '../../../../core/model/occur/occur.model';
import { RncForm } from '../../../../core/model/rnc/rnc-form.model';
import { Rnc } from '../../../../core/model/rnc/rnc.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { RncService } from '../../../../core/service/rnc/rnc-service.service';
import { RncComplementViewerComponent } from '../rnc-complement-viewer/rnc-complement-viewer.component';
import { RncMainViewerComponent } from '../rnc-main-viewer/rnc-main-viewer.component';

@Component({
  selector: "app-rnc-viewer",
  imports: [
    RncMainViewerComponent,
    RncComplementViewerComponent
  ],
  templateUrl: "./rnc-viewer.component.html",
  styleUrl: "./rnc-viewer.component.scss",
  standalone: true,
})
export class RncViewerComponent implements OnInit, OnDestroy {
  public rnc: Rnc | null = null;
  public rncForm: RncForm | null = null;
  public occur: Occur | null = null;
  private subscriptions: Subscription[] = [];
  private rncId: number = 0;

  constructor(
    private rncService: RncService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
    this.loadingService.show();

    const rncIdParam = this.route.snapshot.paramMap.get("id");

    if (!rncIdParam) {
      this.handleError("ID da RNC Inválido");
      return;
    }

    this.rncId = Number(rncIdParam);

    if (isNaN(this.rncId)) {
      this.handleError("ID da RNC Inválido");
      return;
    }

    this.loadRnc();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadRnc(): void {
    this.rncService
      .getRnc(this.rncId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (rnc) => {
          if (rnc) {
            this.rnc = rnc;

            if (rnc.hasFormAssigned && rnc.form?.id) {
              this.loadRncForm(rnc.form.id);
            }
          } else {
            this.handleError("RNC não encontrada");
          }
        },
        error: () => this.handleError("RNC Inválida"),
      });
  }

  private loadRncForm(formId: number): void {
    this.loadingService.show();

    this.rncService.getRncForm(formId).subscribe({
      next: (rncForm) => {
        this.rncForm = rncForm;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar formulário da RNC:', error);
        this.loadingService.hide();
      }
    });
  }

  onRncReloaded(rnc: Rnc): void {
    this.rnc = rnc;
    if (rnc.hasFormAssigned && rnc.form?.id) {
      this.loadRncForm(rnc.form.id);
    }
  }

  onReloadRequested(): void {
    this.loadRnc();
  }

  private handleError(message: string) {
    this.loadingService.hide();
    setTimeout(() => {
      this.router.navigate(["/rncs"], {
        queryParams: { action: "ERROR", message },
      });
    }, 100);
  }
}