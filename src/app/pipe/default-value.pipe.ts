// default-value.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'default',
  standalone: true
})
export class DefaultValuePipe implements PipeTransform {
  transform(value: any, defaultValue: string = 'Não informado'): any {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  }
}