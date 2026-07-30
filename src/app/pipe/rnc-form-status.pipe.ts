import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rncFormStatus',
  standalone: true
})
export class RncFormStatusPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return 'Não informado';

    const statusMap: Record<string, string> = {
      'DRAFT_OPENED': 'Em Rascunho',
      'AWAITING_VALIDATION': 'Aguardando Validação',
      'VALIDATION_EDITION': 'Edição de Validação',
      'AWAITING_IMPLEMENTATION': 'Aguardando Implementação',
      'AWAITING_EFFICACY_ANALYSIS': 'Aguardando Análise de Eficácia',
      'IMPLEMENTATION_EDITION': 'Edição de Implementação',
      'CLOSED': 'Encerrado'
    };

    return statusMap[value] || value;
  }
}