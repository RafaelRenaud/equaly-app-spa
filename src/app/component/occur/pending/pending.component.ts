import { Component } from '@angular/core';
import { SessionService } from '../../../core/service/session/session.service';
import { Occur } from '../../../core/model/occur/occur.model';
import { OccurService } from '../../../core/service/occur/occur.service';
import { Router, RouterModule } from '@angular/router';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { CommonModule } from '@angular/common';
import { forkJoin, finalize } from 'rxjs';

@Component({
  selector: 'app-pending',
  imports: [RouterModule, CommonModule],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.scss'
})
export class OccurPendingComponent {

  public isOpener = false;
  public isInspector = false;

  public awaitingApproveOccurs: Occur[] = [];
  public awaitingApproveOccursPage: number = 0;
  public totalPagesAwaitingApprove: number = 0;

  public awaitingApproveWhatsappOccurs: Occur[] = [];
  public awaitingApproveWhatsappOccursPage: number = 0;
  public totalPagesAwaitingApproveWhatsapp: number = 0;

  public awaitingEditApproveOccurs: Occur[] = [];
  public awaitingEditApproveOccursPage: number = 0;
  public totalPagesAwaitingEditApprove: number = 0;

  public awaitingEditOccurs: Occur[] = [];
  public awaitingEditOccursPage: number = 0;
  public totalPagesAwaitingEdit: number = 0;

  public awaitingInspectionOccurs: Occur[] = [];
  public awaitingInspectionOccursPage: number = 0;
  public totalPagesAwaitingInspection: number = 0;

  public awaitingCloseOccurs: Occur[] = [];
  public awaitingCloseOccursPage: number = 0;
  public totalPagesAwaitingClose: number = 0;

  constructor(
    private sessionService: SessionService,
    private occurService: OccurService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.isOpener = this.sessionService.hasRole('COMMON_EVENT_OPENER');
    this.isInspector = this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR');

    if (this.isOpener) {
      this.loadOpenerData();
    } else if (this.isInspector) {
      this.loadInspectorData();
    }
  }

  loadOpenerData(): void {
    this.loadingService.show();
    
    const userId = Number(this.sessionService.getItem('userId'));
    
    const requests = {
      awaitingApprove: this.occurService.getOccurs(
        {
          status: 'DRAFT_OPENED',
          complaintChannel: 'DALTON',
          openerId: userId
        },
        this.awaitingApproveOccursPage,
        10
      ),
      awaitingApproveWhatsapp: this.occurService.getOccurs(
        {
          status: 'DRAFT_OPENED',
          complaintChannel: 'WHATSAPP',
          openerId: userId
        },
        this.awaitingApproveWhatsappOccursPage,
        10
      ),
      awaitingEdit: this.occurService.getOccurs(
        {
          status: 'AWAITING_EDIT',
          openerId: userId
        },
        this.awaitingEditOccursPage,
        10
      ),
      awaitingClose: this.occurService.getOccurs(
        {
          status: 'AWAITING_CLOSE',
          openerId: userId
        },
        this.awaitingCloseOccursPage,
        10
      )
    };

    forkJoin(requests)
      .pipe(
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (responses) => {
          this.awaitingApproveOccurs = responses.awaitingApprove.occurs;
          this.totalPagesAwaitingApprove = responses.awaitingApprove.pageable?.totalPages || 0;
          
          this.awaitingApproveWhatsappOccurs = responses.awaitingApproveWhatsapp.occurs;
          this.totalPagesAwaitingApproveWhatsapp = responses.awaitingApproveWhatsapp.pageable?.totalPages || 0;
          
          this.awaitingEditOccurs = responses.awaitingEdit.occurs;
          this.totalPagesAwaitingEdit = responses.awaitingEdit.pageable?.totalPages || 0;
          
          this.awaitingCloseOccurs = responses.awaitingClose.occurs;
          this.totalPagesAwaitingClose = responses.awaitingClose.pageable?.totalPages || 0;
        },
        error: (error) => {
          console.error('Error loading opener data:', error);
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: `Ocorreu um erro ao buscar as ocorrências pendentes, tente novamente mais tarde.`
            }
          });
        }
      });
  }

  loadInspectorData(): void {
    this.loadingService.show();
    
    const userId = Number(this.sessionService.getItem('userId'));
    
    const requests = {
      awaitingInspection: this.occurService.getOccurs(
        {
          status: 'AWAITING_REPORT',
          inspectorId: userId
        },
        this.awaitingInspectionOccursPage,
        10
      ),
      awaitingEditApprove: this.occurService.getOccurs(
        {
          status: 'PENDING_EDIT_APPROVAL',
          inspectorId: userId
        },
        this.awaitingEditApproveOccursPage,
        10
      )
    };

    forkJoin(requests)
      .pipe(
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (responses) => {
          this.awaitingInspectionOccurs = responses.awaitingInspection.occurs;
          this.totalPagesAwaitingInspection = responses.awaitingInspection.pageable?.totalPages || 0;
          
          this.awaitingEditApproveOccurs = responses.awaitingEditApprove.occurs;
          this.totalPagesAwaitingEditApprove = responses.awaitingEditApprove.pageable?.totalPages || 0;
        },
        error: (error) => {
          console.error('Error loading inspector data:', error);
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: `Ocorreu um erro ao buscar as ocorrências pendentes, tente novamente mais tarde.`
            }
          });
        }
      });
  }

  // Métodos para recarregar dados individuais após paginação
  reloadAwaitingApproveOccurs(): void {
    this.loadingService.show();
    this.occurService.getOccurs(
      {
        status: 'DRAFT_OPENED',
        complaintChannel: 'DALTON',
      },
      this.awaitingApproveOccursPage,
      10
    ).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.awaitingApproveOccurs = response.occurs;
        this.totalPagesAwaitingApprove = response.pageable?.totalPages || 0;
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Ocorreu um erro ao buscar as ocorrências pendentes de aprovação, tente novamente mais tarde.`
          }
        });
      }
    });
  }

  reloadAwaitingApproveWhatsappOccurs(): void {
    this.loadingService.show();
    this.occurService.getOccurs(
      {
        status: 'DRAFT_OPENED',
        complaintChannel: 'WHATSAPP',
      },
      this.awaitingApproveWhatsappOccursPage,
      10
    ).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.awaitingApproveWhatsappOccurs = response.occurs;
        this.totalPagesAwaitingApproveWhatsapp = response.pageable?.totalPages || 0;
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Ocorreu um erro ao buscar as ocorrências do WhatsApp, tente novamente mais tarde.`
          }
        });
      }
    });
  }

  reloadAwaitingEditOccurs(): void {
    this.loadingService.show();
    this.occurService.getOccurs(
      {
        status: 'AWAITING_EDIT',
        openerId: Number(this.sessionService.getItem('userId'))
      },
      this.awaitingEditOccursPage,
      10
    ).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.awaitingEditOccurs = response.occurs;
        this.totalPagesAwaitingEdit = response.pageable?.totalPages || 0;
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Ocorreu um erro ao buscar as ocorrências pendentes de edição, tente novamente mais tarde.`
          }
        });
      }
    });
  }

  reloadAwaitingCloseOccurs(): void {
    this.loadingService.show();
    this.occurService.getOccurs(
      {
        status: 'AWAITING_CLOSE',
        openerId: Number(this.sessionService.getItem('userId'))
      },
      this.awaitingCloseOccursPage,
      10
    ).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.awaitingCloseOccurs = response.occurs;
        this.totalPagesAwaitingClose = response.pageable?.totalPages || 0;
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Ocorreu um erro ao buscar as ocorrências pendentes de encerramento, tente novamente mais tarde.`
          }
        });
      }
    });
  }

  reloadAwaitingInspectionOccurs(): void {
    this.loadingService.show();
    this.occurService.getOccurs(
      {
        status: 'AWAITING_REPORT',
        inspectorId: Number(this.sessionService.getItem('userId'))
      },
      this.awaitingInspectionOccursPage,
      10
    ).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.awaitingInspectionOccurs = response.occurs;
        this.totalPagesAwaitingInspection = response.pageable?.totalPages || 0;
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Ocorreu um erro ao buscar as ocorrências pendentes de inspeção, tente novamente mais tarde.`
          }
        });
      }
    });
  }

  reloadAwaitingEditApproveOccurs(): void {
    this.loadingService.show();
    this.occurService.getOccurs(
      {
        status: 'PENDING_EDIT_APPROVAL',
        inspectorId: Number(this.sessionService.getItem('userId'))
      },
      this.awaitingEditApproveOccursPage,
      10
    ).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.awaitingEditApproveOccurs = response.occurs;
        this.totalPagesAwaitingEditApprove = response.pageable?.totalPages || 0;
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Ocorreu um erro ao buscar as ocorrências pendentes de aprovação de edição, tente novamente mais tarde.`
          }
        });
      }
    });
  }

  goToPage(type: string, page: number): void {
    switch (type) {
      case 'awaitingApprove':
        this.awaitingApproveOccursPage = page;
        this.reloadAwaitingApproveOccurs();
        break;
      case 'awaitingApproveWhatsapp':
        this.awaitingApproveWhatsappOccursPage = page;
        this.reloadAwaitingApproveWhatsappOccurs();
        break;
      case 'awaitingEdit':
        this.awaitingEditOccursPage = page;
        this.reloadAwaitingEditOccurs();
        break;
      case 'awaitingClose':
        this.awaitingCloseOccursPage = page;
        this.reloadAwaitingCloseOccurs();
        break;
      case 'awaitingInspection':
        this.awaitingInspectionOccursPage = page;
        this.reloadAwaitingInspectionOccurs();
        break;
      case 'awaitingEditApprove':
        this.awaitingEditApproveOccursPage = page;
        this.reloadAwaitingEditApproveOccurs();
        break;
    }
  }
}