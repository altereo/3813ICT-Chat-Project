import { Pipe, PipeTransform } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { ChatApiService, User } from '../chat-api.service';

@Pipe({
  name: 'getUser',
  standalone: true
})
export class GetUserPipe implements PipeTransform {

  transform(id: number, changeTicket: number): Observable<User> {
    return(Observable.create((observer: Observer<User>) => {
      this.chatApiService.fetchUserData(id).subscribe((data: any) => {
        observer.next(data.user);
        observer.complete();
        return;
      });
    }));
  }

  constructor(private chatApiService: ChatApiService) { }
}
