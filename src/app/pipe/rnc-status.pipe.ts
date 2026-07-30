// rnc-status.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rncStatus',
  standalone: true
})
export class RncStatusPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return 'Não informado';

    const statusMap: Record<string, string> = {
      'OPENED': 'Aberta',
      'WORK_IN_PROGRESS': 'Em Andamento',
      'CLOSED': 'Encerrada'
    };

    return statusMap[value] || value;
  }
}