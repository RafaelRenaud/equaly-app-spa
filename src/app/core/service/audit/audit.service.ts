import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuditFilters } from '../../model/audit/audit-filters.model';
import { AuditsResponse } from '../../model/audit/audits-response.model';
import { Observable } from 'rxjs';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuditServiceService {

  private http = inject(HttpClient);

  private readonly endpoint = `${environment.api.core}/audits`;

  private readonly keyMapping: { [key: string]: string } = {
    'status': 'Estado',
    'channel': 'Canal',
    'fileId': 'ID do Arquivo',
    'fileName': 'Nome do Arquivo',
    'fileType': 'Tipo de Arquivo',
    'inspector': 'Inspetor de Qualidade',
    'inspectorReport': 'Relatório do Inspeção',
    'hasRNCOpened': 'RNC Aberta',
    'closeReason': 'Informações de Encerramento',
    'closeStatus': 'Status de Encerramento',
    'occurType': 'Tipo de Ocorrência',
    'occurTitle': 'Título da Ocorrência',
    'occuredDate': 'Data da Ocorrência',
    'rateComment': 'Comentário da Avaliação',
    'rateScore': 'Pontuação da Avaliação'
  };

  constructor(private sessionService: SessionService) { }

  /**
   * GET /audits
   * List Audits with pagination and filters
   */
  getAudits(
    filters: AuditFilters,
    page: number = 0,
    size: number = 10
  ): Observable<AuditsResponse> {
    const headers = this.getDefaultHeaders();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Adicionar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<AuditsResponse>(this.endpoint, {
      headers,
      params
    });
  }

  /**
   * Utility method to get default headers
   */
  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Application-Key': this.sessionService.getItem('clientKey')!,
      'Authorization': this.sessionService.getItem('Authorization')!
    });
  }
}
