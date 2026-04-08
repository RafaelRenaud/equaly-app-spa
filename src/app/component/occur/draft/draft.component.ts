import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { finalize } from 'rxjs';
import { Occur } from '../../../core/model/occur/occur.model';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { OccurService } from '../../../core/service/occur/occur.service';
import { SessionService } from '../../../core/service/session/session.service';
import { OccurFilters } from '../../../core/model/occur/occur-filters.model';

@Component({
  selector: 'app-draft',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './draft.component.html',
  styleUrl: './draft.component.scss',
  standalone: true
})
export class OccurDraftComponent implements AfterViewInit {

  @ViewChild('deleteModal') deleteModal: any;

  public occurs: Occur[] = [];
  currentPage: number = 0;
  totalPages: number = 1;
  pageSize: number = 10;
  
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
      status: 'DRAFT_OPENED',
      openerId: Number(this.sessionService.getItem('userId')),
      page: this.currentPage,
      size: this.pageSize
    };
    
    // Aplica filtro de prioridade (se selecionado)
    if (this.selectedPriority && this.selectedPriority !== '') {
      filters.priority = this.selectedPriority as 'LOW' | 'MEDIUM' | 'HIGH';
    }
    
    // Aplica filtro de data inicial
    if (this.startDate) {
      const [d, m, y] = this.startDate.split('/');
      filters.startOccurredDate = `${y}-${m}-${d}`;
    }
    
    // Aplica filtro de data final
    if (this.endDate) {
      const [d, m, y] = this.endDate.split('/');
      filters.endOccurredDate = `${y}-${m}-${d}`;
    }
    
    // Aplica filtro de busca (ID, CODE ou CONTENT)
    if (this.selectedFilter !== 'NONE' && this.filterValue) {
      if (this.selectedFilter === 'ID') {
        // Busca por ID usa método específico
        this.occurService.getOccur(Number(this.filterValue)).pipe(
          finalize(() => this.loadingService.hide())
        ).subscribe({
          next: (response) => {
            if (response && response.status === 'DRAFT_OPENED' && response.opener?.id === Number(this.sessionService.getItem('userId'))) {
              this.occurs = [response];
              this.totalPages = 1;
            } else {
              this.occurs = [];
              this.totalPages = 1;
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
    
    this.occurService.getOccurs(filters).pipe(
      finalize(() => this.loadingService.hide())
    ).subscribe({
      next: (response) => {
        this.occurs = response.occurs;
        this.totalPages = response.pageable?.totalPages || 1;
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
    this.currentPage = 0;
    this.loadOccurs();
  }

  clearFilters(): void {
    this.selectedFilter = 'NONE';
    this.filterValue = '';
    this.selectedPriority = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 0;
    this.loadOccurs();
  }

  goToPage(page: number): void {
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