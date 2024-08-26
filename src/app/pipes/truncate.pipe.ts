import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {

  transform(text: string, maxLength: number): string {
    return((text.length > maxLength) ? text.slice(0, maxLength) + '...' : text);
  }

}
