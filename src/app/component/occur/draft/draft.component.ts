import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { finalize } from 'rxjs';
import { OccurFilters } from '../../../core/model/occur/occur-filters.model';
import { Occur } from '../../../core/model/occur/occur.model';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { OccurService } from '../../../core/service/occur/occur.service';
import { SessionService } from '../../../core/service/session/session.service';

@Component({
  selector: 'app-draft',
  imports: [RouterModule, CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
  standalone: true
})
export class OccurDraftComponent implements AfterViewInit {

  @ViewChild('deleteModal') deleteModal: any;

  public occurs: Occur[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  collectionSize: number = 0;

  // Filtros
  selectedFilter: string = 'NONE';
  filterValue: string = '';
  selectedPriority: string = '';
  startDate: string = '';
  endDate: string = '';

  occurToDelete: Occur | null = null;

  constructor(
    private occurService: OccurService,
    private sessionService: SessionService,
    private router: Router,
    private loadingService: LoadingService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadOccurs();
  }

  ngAfterViewInit(): void {
    this.initFlatpickr();
  }

  initFlatpickr(): void {
    const startDateInput = document.getElementById('startDate') as HTMLInputElement;
    const endDateInput = document.getElementById('endDate') as HTMLInputElement;

    if (startDateInput) {
      flatpickr(startDateInput, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        maxDate: 'today',
        onChange: (selectedDates: Date[], dateStr: string) => {
          this.startDate = dateStr;
        }
      });
    }

    if (endDateInput) {
      flatpickr(endDateInput, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        maxDate: 'today',
        onChange: (selectedDates: Date[], dateStr: string) => {
          this.endDate = dateStr;
        }
      });
    }
  }

  loadOccurs(): void {
    this.loadingService.show();

    let filters: OccurFilters = {
      status: ['DRAFT_OPENED'],
      openerId: Number(this.sessionService.getItem('userId'))
    };

    if (this.selectedPriority && this.selectedPriority !== '') {
      filters.priority = this.selectedPriority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    if (this.startDate) {
      const [d, m, y] = this.startDate.split('/');
      filters.startOccurredDate = `${y}-${m}-${d}`;
    }

    if (this.endDate) {
      const [d, m, y] = this.endDate.split('/');
      filters.endOccurredDate = `${y}-${m}-${d}`;
    }

    if (this.selectedFilter !== 'NONE' && this.filterValue) {
      if (this.selectedFilter === 'ID') {
        this.occurService.getOccur(Number(this.filterValue)).pipe(
          finalize(() => this.loadingService.hide())
        ).subscribe({
          next: (response) => {
            if (response && response.status === 'DRAFT_OPENED' && response.opener?.id === Number(this.sessionService.getItem('userId'))) {
              this.occurs = [response];
              this.totalPages = 1;
              this.collectionSize = 1;
            } else {
              this.occurs = [];
              this.totalPages = 1;
              this.collectionSize = 0;
              this.router.navigate([], {
                queryParams: {
                  action: "WARNING",
                  message: `Nenhum rascunho encontrado com o ID ${this.filterValue}.`
                }
              });
            }
          },
          error: (error) => {
            this.occurs = [];
            this.totalPages = 1;
            this.collectionSize = 0;
            this.router.navigate([], {
              queryParams: {
                action: "WARNING",
                message: `Nenhum rascunho encontrado com o ID ${this.filterValue}.`
              }
            });
          }
        });
        return;
      } else if (this.selectedFilter === 'CODE') {
        filters.occurCode = this.filterValue;
      } else if (this.selectedFilter === 'CONTENT') {
        filters.content = this.filterValue;
      }
    }

    this.occurService.getOccurs(filters, this.currentPage - 1, this.pageSize).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.occurs = response.occurs;
        this.totalPages = response.pageable?.totalPages || 1;
        this.collectionSize = response.pageable?.totalElements || 0;
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao carregar rascunhos. Tente novamente mais tarde.`
          }
        });
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadOccurs();
  }

  clearFilters(): void {
    this.selectedFilter = 'NONE';
    this.filterValue = '';
    this.selectedPriority = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.loadOccurs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOccurs();
  }

  openDeleteModal(content: any, occur: Occur): void {
    this.occurToDelete = occur;
    this.modalService.open(content, { centered: true });
  }

  confirmDelete(modal: any): void {
    if (this.occurToDelete) {
      this.loadingService.show();
      this.occurService.deleteOccur(this.occurToDelete.id!).pipe(
        finalize(() => this.loadingService.hide())
      ).subscribe({
        next: () => {
          modal.close();
          this.router.navigate([], {
            queryParams: {
              action: "SUCCESS",
              message: `Rascunho ${this.occurToDelete?.code} excluído com sucesso.`
            }
          });
          this.loadOccurs();
        },
        error: (error) => {
          modal.close();
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao excluir rascunho. Tente novamente mais tarde.`
            }
          });
        }
      });
    }
  }
}