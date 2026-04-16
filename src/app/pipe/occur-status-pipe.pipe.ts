import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'occurStatus',
  standalone: true
})
export class OccurStatusPipe implements PipeTransform {

  private readonly statusMap: Record<string, string> = {
    'DRAFT_OPENED': 'Em Rascunho',
    'PENDING_EDIT_APPROVAL': 'Aguardando Aprovação de Edição',
    'AWAITING_EDIT': 'Aguardando Edição',
    'AWAITING_REPORT': 'Aguardando Inspeção de Qualidade',
    'AWAITING_CLOSE': 'Aguardando Encerramento',
    'AWAITING_RATING': 'Aguardando Feedback do Reclamante',
    'CLOSED': 'Encerrado'
  };

  transform(status: string | undefined | null): string {
    if (!status) return 'Desconhecido';
    return this.statusMap[status] || status;
  }
}