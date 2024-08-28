import { Component, OnInit, Inject, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterOutlet, Router } from '@angular/router';
import {
  NgbAccordionModule,
  NgbOffcanvas,
  OffcanvasDismissReasons,
  NgbOffcanvasRef,
  NgbDropdownModule,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

import { TruncatePipe } from '../pipes/truncate.pipe';
import { GetRoleByIDPipe } from '../pipes/get-role-by-id.pipe';
import { GetRoleNoAPIPipe } from '../pipes/get-role-no-api.pipe';
import { GetServerByIDPipe } from '../pipes/get-server-by-id.pipe';
import { GetUsernameByIDPipe } from '../pipes/get-username-by-id.pipe';
import { ChatApiService, User, Group, Channel } from '../chat-api.service';

/*
  Intended functions for settings panel:
  - Display user information and logout button at bottom of server list. (discord style)
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
    NgbDropdownModule,
    GetServerByIDPipe,
    GetUsernameByIDPipe,
    TruncatePipe,
    GetRoleByIDPipe,
    GetRoleNoAPIPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  userID: number = -1;
  groups: Observable<Group[]>;
  
  targetID: number = -1;
  targetGroup: Group | undefined = undefined;

  // Form stuff.
  private offCanvasRef: NgbOffcanvasRef | null = null;
  private modalRef: NgbModalRef | null = null;
  groupName: string = "";
  channelName: string = "";
  newGroupName: string = "";

  hasAdminRole() {
    if (!this.user) return(false);

    return(this.user.roles.filter((role: string) => role.includes('ADMIN')).length > 0);
  }

  updateCachedGroup() {
    let groupsList = this.chatApiService.getGroupsValue();
    this.targetGroup = groupsList.find((group: Group) => group.id === this.targetID);
    this.groupName = this.targetGroup?.name || "";

    this.cdr.detectChanges();
    return;
  }

  approveRejectUser(state: boolean, id: number) {
    this.chatApiService.approveRejectRequest(id, this.targetID, state, this.userID).subscribe((data: any) => {
      this.chatApiService.getGroups(this.userID);
      return;
    });
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

  submitRenameGroup() {
    if (this.groupName === "") return;
    this.chatApiService.renameGroup(this.targetID, this.groupName, this.userID).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
        return;
      }
    });
    return;
  }

  onChannelInput(e: Event) {
    const input = e.target as HTMLInputElement;

    this.channelName = input.value.replace(/\s+/g, '-').toLowerCase();
    return;
  }

  submitCreateChannel() {
    if (this.channelName === "") return;

    this.chatApiService.requestCreateChannel(
      this.targetID,
      this.channelName,
      this.userID
    ).subscribe((data: any) => {
      if (data.status === "OK") {
        this.channelName = "";
        this.chatApiService.getGroups(this.userID);
        return;
      }
    });
    return;
  }

  deleteChannel(id: number) {
    this.chatApiService.requestDeleteChannel(
      this.targetID,
      id,
      this.userID
    ).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
      }
    })
    return;
  }

  deleteGroup() {
    this.chatApiService.requestDeleteGroup(
      this.targetID,
      this.userID
    ).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
        if (this.offCanvasRef) {
          this.offCanvasRef.close();
        }

        this.router.navigateByUrl("/home");
      }
      return;
    })
  }

  createGroup() {
    this.chatApiService.requestCreateGroup(
      this.newGroupName,
      this.userID
    ).subscribe((data: any) => {
      if (data.status === "OK") {
        if (this.modalRef) {
          this.newGroupName = "";
          this.modalRef.close();
        }
        this.chatApiService.updateRoles(data.roles);
        this.chatApiService.getGroups(this.userID);
        this.router.navigateByUrl("/home");
      }
      return;
    });

    return;
  }

  openCreateJoinGroup(content: TemplateRef<any>) {
    this.modalRef = this.modalService.open(content);
    return;
  } 

  openSettings(content: TemplateRef<any>, id: number) {
    this.targetID = id;
    this.chatApiService.getGroups(this.userID);
    
    this.offCanvasRef = this.offCanvasService.open(content);
    return;
  }

  ngOnInit() {
    if (this.chatApiService.isLoggedIn()) {
      this.chatApiService.user.subscribe((data: any) => {
        this.user = data;
        this.userID = data?.id || -1;
      });

      this.user = this.chatApiService.getUser();
      this.userID = this.user?.id || -1;
      
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
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    this.groups = this.chatApiService.groups;
  }
}
