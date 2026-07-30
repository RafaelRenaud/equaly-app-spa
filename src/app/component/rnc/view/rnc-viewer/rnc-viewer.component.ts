// rnc-viewer.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Rnc } from '../../../../core/model/rnc/rnc.model';
import { RncForm } from '../../../../core/model/rnc/rnc-form.model';
import { Occur } from '../../../../core/model/occur/occur.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../core/service/occur/occur.service';
import { RncService } from '../../../../core/service/rnc/rnc-service.service';
import { RncMainViewerComponent } from '../rnc-main-viewer/rnc-main-viewer.component';

@Component({
  selector: "app-rnc-viewer",
  imports: [
    RncMainViewerComponent,
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
    private occurService: OccurService,
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
            // ❌ REMOVIDO: Não carrega a ocorrência automaticamente
            // A ocorrência será carregada sob demanda pelo accordion

            // Se tiver formulário associado, busca os dados do formulário
            if (rnc.hasFormAssigned) {
              this.loadRncForm();
            }
          } else {
            this.handleError("RNC não encontrada");
          }
        },
        error: () => this.handleError("RNC Inválida"),
      });
  }

  private loadRncForm(): void {
    // TODO: Implementar busca do formulário quando tiver o endpoint
    console.log('Carregando formulário para RNC:', this.rncId);
  }

  // ✅ REMOVIDO: O pai não precisa mais recarregar a ocorrência
  // O RncMainViewerComponent gerencia o cache internamente
  onRncReloaded(rnc: Rnc): void {
    this.rnc = rnc;
    // Não recarrega a ocorrência aqui
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