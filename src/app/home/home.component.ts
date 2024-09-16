import { Component, OnInit, Inject, TemplateRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLink, RouterOutlet, Router } from '@angular/router';
import {
  NgbModal,
  NgbModalRef,
  NgbOffcanvas,
  NgbOffcanvasRef,
  NgbDropdownModule,
  NgbAccordionModule,
  OffcanvasDismissReasons
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';

import { GetUserPipe } from '../pipes/get-user.pipe';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { GetRoleNoAPIPipe } from '../pipes/get-role-no-api.pipe';
import { GetServerByIDPipe } from '../pipes/get-server-by-id.pipe';
import { GetUsernameByIDPipe } from '../pipes/get-username-by-id.pipe';
import { ChatApiService, User, Group, Channel } from '../chat-api.service';

/*
  Todo:
  - add logout button
  - add manage user button
*/

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    GetUserPipe,
    CommonModule,
    RouterModule,
    TruncatePipe,
    GetRoleNoAPIPipe,
    NgbDropdownModule,
    GetServerByIDPipe,
    NgbAccordionModule,
    GetUsernameByIDPipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  @ViewChild('groupModal', {static: false}) groupModal!: TemplateRef<any>;

  user: User | null = null;
  userID: number = -1;
  groups: Observable<Group[]>;
  
  targetID: number = -1;
  targetGroup: Group | undefined = undefined;
  changeDetectionTicket: number = 0;

  // Form stuff.
  private offCanvasRef: NgbOffcanvasRef | null = null;
  private modalRef: NgbModalRef | null = null;
  groupName: string = "";
  channelName: string = "";
  newGroupName: string = "";
  joinCode: string = "";

  isMe = (id: number) => this.userID === id;


  hasAdminRole() {
    if (!this.user) return(false);
    if (!this.user.roles) return(false);

    return(this.user.roles.filter((role: string) => role.includes('ADMIN')).length > 0);
  }

  getHighestRole(groupID: number) {
    if (!this.user) return(0);
    if (!this.user.roles) return(0);

    if (this.user.roles.includes("SUPERADMIN")) return(2);
    if (this.user.roles.filter((role: string) => role.includes(`${groupID}::`))) return(1);

    return(0);
  }

  updateCachedGroup() {
    let groupsList = this.chatApiService.getGroupsValue();
    this.targetGroup = groupsList.find((group: Group) => group.id === this.targetID);

    if (!this.user?.groups.includes(this.targetID)) {
      if (this.offCanvasRef) {
        this.offCanvasRef.close();
      }
    }
    
    this.changeDetectionTicket = this.chatApiService.generateID(8);
    this.groupName = this.targetGroup?.name || "";

    this.cdr.detectChanges();
    return;
  }

  approveRejectUser(state: boolean, id: number) {
    this.chatApiService.approveRejectRequest(id, this.targetID, state, this.userID).subscribe((data: any) => {
      this.chatApiService.getGroups(this.userID);
      this.chatApiService.announceGroupChange();
      return;
    });
    return;
  }

  kickUser(id: number) {
    this.chatApiService.removeUserFromServer(id, this.targetGroup?.id || -1, this.userID).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
        this.chatApiService.announceGroupChange();
        return;
      }
    });
    return;
  }

  leaveGroup() {
    this.chatApiService.removeUserFromServer(this.userID, this.targetGroup?.id || -1, this.userID).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
        this.chatApiService.announceGroupChange();
        if (this.offCanvasRef) {
          this.offCanvasRef.close();
        }

        this.router.navigateByUrl("/home");
      }
    });
    return;
  }

  submitRenameGroup() {
    if (this.groupName === "") return;
    this.chatApiService.renameGroup(this.targetID, this.groupName, this.userID).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
        this.chatApiService.announceGroupChange();
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
        this.chatApiService.announceGroupChange();
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
        this.chatApiService.announceGroupChange();
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
        this.chatApiService.announceGroupChange();
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
        this.chatApiService.updateUser();
        this.chatApiService.getGroups(this.userID);
        this.router.navigateByUrl("/home");
      }
      return;
    });

    return;
  }

  convertGroupIdToCode(groupID: number): string {
    let id = BigInt(groupID);
    return id.toString(36).toUpperCase();
  }

  copyGroupCode(groupID: number) {
    navigator.clipboard.writeText(this.convertGroupIdToCode(groupID));
    return;
  }

  onGroupCodeInput(e: Event) {
    const input = e.target as HTMLInputElement;

    this.joinCode = input.value.toUpperCase();
    return;
  }

  requestJoinGroup() {
    this.chatApiService.requestJoinGroup(
      this.joinCode,
      this.userID
    ).subscribe((data: any) => {
      if (data.status === "OK") {
        if (this.modalRef) {
          this.joinCode = "";
          this.modalRef.close();
        }
        this.chatApiService.getGroups(this.userID);
        this.chatApiService.announceGroupChange();
      }
      return;
    });

    return;
  }

  promoteDemoteUser(id: number, level: number) {
    this.chatApiService.promoteDemoteUser(
      this.targetID,
      id,
      level,
      this.userID
    ).subscribe((data: any) => {
      if (data.status === "OK") {
        this.chatApiService.getGroups(this.userID);
        this.chatApiService.announceGroupChange();
      }
    })
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
      });

      this.chatApiService.onGroupChanged().subscribe((id: number) => {
        this.chatApiService.updateUser();
        this.chatApiService.getGroups(this.userID);
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
