import { Component, OnInit, Inject, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterOutlet, Router } from '@angular/router';
import { NgbAccordionModule, NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { TruncatePipe } from '../pipes/truncate.pipe';
import { GetRoleByIDPipe } from '../pipes/get-role-by-id.pipe';
import { GetServerByIDPipe } from '../pipes/get-server-by-id.pipe';
import { GetUsernameByIDPipe } from '../pipes/get-username-by-id.pipe';
import { ChatApiService, Group, Channel } from '../chat-api.service';

/*
  Intended functions for settings panel:
  - List users (promote, from user to any admin level/remove/ban)
  - Approve join requests: Join requests should be done via a shareable join code (a hash of group id)
  - Manage channels
  - Rename/delete group
  - All features should include a toggle for their relevant permission level.
      Basically, if they don't have superadmin or they don't have an admin with
      correct server id, don't show administrative actions.
*/

/*
  As for checking if users can create groups,
  check if user has any roles (since any admin position can create
  and roles only store admin stuff.)

*/

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbAccordionModule,
    GetServerByIDPipe,
    GetUsernameByIDPipe,
    TruncatePipe,
    GetRoleByIDPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private userID = -1;
  groups: Observable<Group[]>;
  
  targetID: number = -1;
  targetGroup: Group | undefined = undefined;
  groupName: string = "";

  updateCachedGroup() {
    let groupsList = this.chatApiService.getGroupsValue();
    this.targetGroup = groupsList.find((group: Group) => group.id === this.targetID);
    this.groupName = this.targetGroup?.name || "";

    this.cdr.detectChanges();
    return;
  }

  kickUser(id: number) {
    this.chatApiService.removeUserFromServer(id, this.targetGroup?.id || -1, this.userID).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
        return;
      }
    });
    return;
  }

  openSettings(content: TemplateRef<any>, id: number) {
    this.targetID = id;
    this.chatApiService.getGroups(this.userID);
    
    this.offCanvasService.open(content).result.then((result: any) => {
      console.debug(result);
    });
    return;
  }

  ngOnInit() {
    if (this.chatApiService.isLoggedIn()) {
      this.userID = this.chatApiService.getUser()?.id || -1;
      
      setTimeout(() => {
        this.chatApiService.synchroniseService();
      }, 0);

      if (this.userID !== -1) {
        this.chatApiService.getGroups(this.userID);
      }

      this.groups.subscribe((data: any) => {
        if (this.targetID !== -1) {
          this.updateCachedGroup();
        }
      })
    }
    return;
  }

  constructor (
    private router:Router,
    private chatApiService: ChatApiService,
    private offCanvasService: NgbOffcanvas,
    private cdr: ChangeDetectorRef
  ) {
    this.groups = this.chatApiService.groups;
  }
}
