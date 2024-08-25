import { Component, OnInit, Inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterOutlet, Router } from '@angular/router';
import { NgbAccordionModule, NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

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
    NgbAccordionModule,
    GetServerByIDPipe,
    GetUsernameByIDPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private userID = -1;
  groups: Observable<Group[]>;
  
  targetID: number = -1;
  targetGroup: Group | undefined = undefined;


  openSettings(content: TemplateRef<any>, id: number) {
    let groupsList = this.chatApiService.getGroupsValue();

    this.targetID = id;
    this.targetGroup = groupsList.find((group: Group) => group.id === id);
    
    this.offCanvasService.open(content).result.then((result: any) => {
      console.debug(this);
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
        this.chatApiService.getGroups(this.userID)
      }
    }
    return;
  }

  constructor (private router:Router, private chatApiService: ChatApiService, private offCanvasService: NgbOffcanvas) {
    this.groups = this.chatApiService.groups;
  }
}
