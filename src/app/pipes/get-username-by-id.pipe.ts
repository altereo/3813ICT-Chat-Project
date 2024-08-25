import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

import { ChatApiService } from '../chat-api.service';

@Pipe({
  name: 'getUsernameByID',
  standalone: true
})
export class GetUsernameByIDPipe implements PipeTransform {

  transform(id: number): Observable<any> {
    return(this.chatApiService.getUsername(id));
  }

  constructor(private chatApiService: ChatApiService) { }
}
