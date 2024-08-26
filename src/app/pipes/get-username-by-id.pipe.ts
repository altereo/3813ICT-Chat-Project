import { Pipe, PipeTransform } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { ChatApiService } from '../chat-api.service';

@Pipe({
  name: 'getUsernameByID',
  standalone: true
})
export class GetUsernameByIDPipe implements PipeTransform {

  transform(id: number): Observable<string> {
    return(Observable.create((observer: Observer<string>) => {
      this.chatApiService.getUsername(id).subscribe((data: any) => {
        observer.next(data.username);
        observer.complete();
      });
    }));
  }

  constructor(private chatApiService: ChatApiService) { }
}
