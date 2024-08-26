import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable, Observer } from 'rxjs';

import { ChatApiService, Group } from '../chat-api.service';

@Pipe({
  name: 'getRoleByID',
  standalone: true
})
export class GetRoleByIDPipe implements PipeTransform {
  private asyncPipe: AsyncPipe;

  transform(id: number, groupID: number): Observable<string> {
    return(Observable.create((observer: Observer<string>) => {
      this.chatApiService.getRoles(id).subscribe((data: any) => {
        let roleList = data.roles;
        if (roleList.length === 0) {
          observer.next("User");
        } else if (roleList.includes("SUPERADMIN")) {
          observer.next("Operator");
        } else if (roleList.find((role: string) => role.startsWith(`${groupID}::`))) {
          observer.next("Admin");
        } else {
          observer.next("User");
        }

        observer.complete();
      });
    }));
  }

  ngOnDestroy() {
    this.asyncPipe.ngOnDestroy();
  }
  constructor (private chatApiService: ChatApiService, private cdr: ChangeDetectorRef) {
    this.asyncPipe = new AsyncPipe(this.cdr);
  }
}
