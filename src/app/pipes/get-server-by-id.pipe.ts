import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

import { ChatApiService, Group } from '../chat-api.service';


@Pipe({
  name: 'getServerByID',
  standalone: true
})
export class GetServerByIDPipe implements PipeTransform {
  private asyncPipe: AsyncPipe


  transform(groups: Observable<Group[]>, id: number): Group | undefined {
    let groupList = this.asyncPipe.transform(groups);

    if (!groupList) return;
    return groupList.find((group: Group | undefined) => group?.id === id);
  }

  ngOnDestroy() {
    this.asyncPipe.ngOnDestroy();
  }
  constructor (private chatApiService: ChatApiService, private cdr: ChangeDetectorRef) {
    this.asyncPipe = new AsyncPipe(this.cdr);
  }
}
