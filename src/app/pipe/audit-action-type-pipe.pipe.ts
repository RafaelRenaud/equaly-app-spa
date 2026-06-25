import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'auditActionTypePipe'
})
export class AuditActionTypePipePipe implements PipeTransform {

  private readonly statusMap: Record<string, string> = {
    'CREATE': 'CADASTRO',
    'READ': 'VISUALIZAÇÃO',
    'UPDATE': 'ATUALIZAÇÃO',
    'DELETE': 'EXCLUSÃO'
  };

  transform(status: string | undefined | null): string {
    if (!status) return 'Desconhecido';
    return this.statusMap[status] || status;
  }

}
