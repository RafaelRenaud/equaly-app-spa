import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rncCauseCategory',
  standalone: true
})
export class RncCauseCategoryPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return 'Não informado';

    const categoryMap: Record<string, string> = {
      'MACHINE': 'Máquina',
      'METHOD': 'Método',
      'MOTHER_NATURE': 'Meio Ambiente',
      'MANPOWER': 'Mão de Obra',
      'MEASUREMENTS': 'Medições'
    };

    return categoryMap[value] || value;
  }
}