import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Occur } from '../../../../../core/model/occur/occur.model';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FileService } from '../../../../../core/service/file/file.service';
import { LoadingService } from '../../../../../core/service/loading/loading.service';
import { FileResponse } from '../../../../../core/model/file/file-response.model';
import { FileAccessResponse } from '../../../../../core/model/file/file-access.model';
import { FilesResponse } from '../../../../../core/model/file/files-response.model';
import { SessionService } from '../../../../../core/service/session/session.service';

interface EditRequest {
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    description: string;
    requestedBy: string;
    requestedAt: string;
}

interface Activity {
    id: number;
    type: 'CREATE' | 'UPDATE' | 'ATTACHMENT' | 'COMMENT';
    action: string;
    description: string;
    performedBy: string;
    createdAt: string;
}

interface DaltonRating {
    id: number;
    category: string;
    score: number;
    comment: string;
    evaluatedAt: string;
}

@Component({
    selector: 'app-occur-complement-viewer',
    imports: [CommonModule, NgbNavModule, DatePipe],
    templateUrl: './occur-complement-viewer.component.html',
    styleUrl: './occur-complement-viewer.component.scss',
    standalone: true
})
export class OccurComplementViewerComponent implements OnInit {

    @Input() occur: Occur | null = null;

    // Controle da aba ativa
    activeTab: string = 'attachments';

    // Estados de loading
    isLoadingFiles = false;
    isLoadingEditRequests = false;
    isLoadingActivities = false;
    isLoadingRatings = false;

    // Dados
    existingFiles: FileResponse[] = [];
    editRequests: EditRequest[] = [];
    activities: Activity[] = [];
    ratings: DaltonRating[] = [];

    isDaltonEnabled: boolean = false;

    constructor(
        private fileService: FileService,
        private loadingService: LoadingService,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {
        if (this.occur?.id) {
            this.loadAttachments();
            this.loadEditRequests();
            this.loadActivities();
            this.loadRatings();
        }

        this.isDaltonEnabled = this.sessionService.getItem("isDaltonEnabled") === 'true';
    }

    // ==================================================
    // CARREGAMENTO DE DADOS
    // ==================================================

    private loadAttachments(): void {
        if (!this.occur?.id) return;
        
        this.isLoadingFiles = true;
        
        this.fileService.getFiles(this.occur.id.toString(), 'OCCUR', 0, 100).subscribe({
            next: (response: FilesResponse) => {
                // Verifica a estrutura correta do FilesResponse
                // Geralmente vem como { content: [], totalElements, totalPages, etc }
                if (response && response.files && Array.isArray(response.files)) {
                    this.existingFiles = response.files;
                } else if (response && Array.isArray(response)) {
                    this.existingFiles = response;
                } else {
                    this.existingFiles = [];
                }
                
                console.log('Arquivos carregados:', this.existingFiles);
                this.isLoadingFiles = false;
            },
            error: (error) => {
                console.error('Erro ao carregar arquivos:', error);
                this.isLoadingFiles = false;
            }
        });
    }

    private loadEditRequests(): void {
        this.isLoadingEditRequests = true;
        
        // TODO: Substituir pela chamada real da API
        setTimeout(() => {
            this.editRequests = [];
            this.isLoadingEditRequests = false;
        }, 500);
    }

    private loadActivities(): void {
        this.isLoadingActivities = true;
        
        // TODO: Substituir pela chamada real da API
        setTimeout(() => {
            this.activities = [];
            this.isLoadingActivities = false;
        }, 500);
    }

    private loadRatings(): void {
        this.isLoadingRatings = true;
        
        // TODO: Substituir pela chamada real da API
        setTimeout(() => {
            this.ratings = [];
            this.isLoadingRatings = false;
        }, 500);
    }

    // ==================================================
    // MANIPULAÇÃO DE ARQUIVOS
    // ==================================================

    viewFile(file: FileResponse): void {
        if (!this.occur?.id) return;
        
        this.loadingService.show();
        
        this.fileService.getFileAccess(file.id!, this.occur.id.toString(), 'OCCUR', file.hash!).subscribe({
            next: (response: FileAccessResponse) => {
                this.loadingService.hide();
                window.open(`${response.url}?${response.access_token}`, '_blank');
            },
            error: (error) => {
                console.error('Erro ao acessar arquivo:', error);
                this.loadingService.hide();
                this.showAlert('ERROR', 'Erro ao acessar o arquivo. Tente novamente.');
            }
        });
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    private showAlert(type: 'SUCCESS' | 'WARNING' | 'ERROR', message: string): void {
        console.log(`${type}: ${message}`);
    }
}