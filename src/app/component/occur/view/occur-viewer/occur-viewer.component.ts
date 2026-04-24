import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Occur } from '../../../../core/model/occur/occur.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../core/service/occur/occur.service';
import { OccurComplementViewerComponent } from "../main-viewer/occur-complement-viewer/occur-complement-viewer.component";
import { OccurMainViewerComponent } from "../main-viewer/occur-main-viewer/occur-main-viewer.component";

@Component({
  selector: 'app-occur-viewer',
  imports: [OccurMainViewerComponent, OccurComplementViewerComponent],
  templateUrl: './occur-viewer.component.html',
  styleUrl: './occur-viewer.component.scss',
  standalone: true
})
export class OccurViewerComponent implements OnInit {

  public occur: Occur | null = null;

  constructor(
    private occurService: OccurService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.loadingService.show();

    const occurIdParam = this.route.snapshot.paramMap.get("id");

    if (!occurIdParam) {
      this.handleError("ID da Ocorrência Inválido");
      return;
    }

    const occurId = Number(occurIdParam);

    if (isNaN(occurId)) {
      this.handleError("ID da Ocorrência Inválido");
      return;
    }

    this.occurService.getOccur(occurId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        })
      )
      .subscribe({
        next: (occur) => {
          if (occur) {
            this.occur = occur;
          } else {
            this.handleError("Ocorrência não encontrada");
          }
        },
        error: (err) => {
          this.handleError("Ocorrência Inválida");
        }
      });
  }

  private handleError(message: string) {
    this.loadingService.hide();
    setTimeout(() => {
      this.router.navigate(["/occurs"], {
        queryParams: {
          action: "ERROR",
          message: message,
        },
      });
    }, 100);
  }
}