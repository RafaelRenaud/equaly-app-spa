import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rncCauseType',
  standalone: true
})
export class RncCauseTypePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return 'Não informado';

    const typeMap: Record<string, string> = {
      'ROOT': 'Raiz',
      'CONTRIBUTING': 'Contribuinte'
    };

    return typeMap[value] || value;
  }
}