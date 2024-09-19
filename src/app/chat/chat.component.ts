import { Component, OnInit, OnDestroy, AfterViewChecked, Input, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, RouterLink, RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TruncatePipe } from '../pipes/truncate.pipe';
import { ChatApiService, User, Group, Channel, Message, ChannelUpdate } from '../chat-api.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPopoverModule, TruncatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messageInput', {static: false}) private messageInputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('autoScroll', {static: false}) private chatScrollElement!: ElementRef<HTMLElement>;
  private _destroy: Subject<any> = new Subject();
  private serverID = "";
  private channelID = "";
  chatTitle = "";
  messages: Message[][] = []; // Convert this to a group of groups of messages, so that we can do discord style without too much trouble

  // Bind the input box so we can clear it later.
  message = "";
  fileInput = "";
  blobURL = "";
  toUpload: File | null = null;

  // For larger image view.
  modalRef: NgbModalRef | null = null;
  imageURL = "";

  // Chat log scrolling.
  canScrollToBottom: boolean = true;

  // Keep track of what other users are viewing the channel
  viewers: User[] = [];
  isCallRunning: boolean = false;

  // Get human friendly date from Date.
  getDate(date: string) {
    return(new Date(date).toLocaleString('en-GB'));
  }

  // On file input change.
  onFileChange(event: any) {
    let files = event.target.files as FileList;

    if (files.length > 0) {
      let _file = URL.createObjectURL(files[0]);
      this.blobURL = _file;
      this.toUpload = files[0];
      this.fileInput = "";
    }

    this.messageInputElement.nativeElement.focus();
    return;
  }

  // Clear the upload.
  clearUpload() {
    this.toUpload = null;
    this.blobURL = "";
  }

  // Send message.
  sendMessage(newMessage: string) {
    if (!this.toUpload) {
      this.chatApiService.emitMessage(
        +this.serverID,
        +this.channelID,
        this.chatApiService.getUser().id,
        this.message,
        null
      );
    } else {
      // Upload the image first.
      let toSend = this.message;
      if (this.toUpload) {
        this.chatApiService.uploadImage(this.toUpload).subscribe((data: any) => {
          this.chatApiService.emitMessage(
            +this.serverID,
            +this.channelID,
            this.chatApiService.getUser().id,
            toSend,
            data.filename
          );
        });

        this.clearUpload();
      }
    }

    this.message = "";
    return;
  }

  openImageViewer(url: string, content: TemplateRef<any>) {
    this.imageURL = url;
    this.modalRef = this.modalService.open(content, {
      centered: true,
      modalDialogClass: "image-viewer-modal"
    });

    document.querySelector(".viewer-container")?.addEventListener('click', (event) => {
      if (this.modalRef) {
        this.modalRef?.dismiss();
      }
    })
    return;
  }

  navigateToCall() {
    if (this.serverID && this.channelID) {
      this.router.navigateByUrl(`/call/${this.serverID}::${this.channelID}`);
    }
    return;
  }

  appendMessage(data: Message) {
    if (`${data.group}` === this.serverID && `${data.channel}` === this.channelID) {
      if (this.messages.length === 0) {
        this.messages.push([data]);
        return;
      }

      let lastGroup = this.messages[this.messages.length - 1];
      let cDate = new Date(data.date).getTime();
      let pDate = new Date(lastGroup[lastGroup.length - 1].date).getTime();

      if (
        cDate - pDate <= 90000 && data.author &&
        data.author?.id === lastGroup[lastGroup.length - 1].author?.id &&
        data.author?.image === lastGroup[lastGroup.length - 1].author?.image
      ) {
        this.messages[this.messages.length - 1].push(data);
      } else {
        this.messages.push([data]);
      }

      this.scrollToBottom();
    }
    return;
  }

  // Implementation for pagination system.
  fetchNextPage() {
    if (this.messages.length > 0 && this.messages[0].length > 0) {
      this.chatApiService.fetchMessages(this.messages[0][0].date, +this.serverID, +this.channelID).subscribe((data: any) => {
        if (data.status === "OK") {
          let newMessageData: Message[][] = [];
          data.messages.forEach((mData: Message) => {
            if (newMessageData.length === 0) {
              newMessageData.push([mData]);
            } else {
              let lastGroup = newMessageData[newMessageData.length - 1];
              let cDate = new Date(mData.date).getTime();
              let pDate = new Date(lastGroup[lastGroup.length - 1].date).getTime();

              if (
                cDate - pDate <= 90000 && mData.author &&
                mData.author?.id === lastGroup[lastGroup.length - 1].author?.id &&
                mData.author?.image === lastGroup[lastGroup.length - 1].author?.image
              ) {
                newMessageData[newMessageData.length - 1].push(mData);
              } else {
                newMessageData.push([mData]);
              }
            }
          });

          let container = this.chatScrollElement.nativeElement
          let oldHeight = container.scrollHeight;
          this.messages = [...newMessageData, ...this.messages];

          setTimeout(() => {
            container.scrollTop = container.scrollHeight - oldHeight;
          }, 0)
        }
      })
    }
    return;
  }

  onScroll() {
    let { scrollTop, scrollHeight, clientHeight } = this.chatScrollElement.nativeElement;
    this.canScrollToBottom = scrollTop + clientHeight >= scrollHeight;
    
    if (scrollTop === 0) {
      this.fetchNextPage();
    }
    return;
  }

  scrollToBottom() {
    if (this.canScrollToBottom) {
      this.chatScrollElement.nativeElement.scrollTop = this.chatScrollElement.nativeElement.scrollHeight;
    }
    return;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      let path: string[] = params.get('path' as string)?.split("::") || [];
      if (path.length === 2) {
        this.serverID = path[0];
        this.channelID = path[1];

        this.chatTitle = this.chatApiService.getChatTitle(+this.serverID, +this.channelID);
        this.messages = [];
        this.chatApiService.fetchMessages("", +this.serverID, +this.channelID).subscribe((data: any) => {
          if (data.status === "OK") {
            data.messages.forEach((message: Message) => this.appendMessage(message));
          } else {
            this.messages = [];
          }
        })
        
        this.chatApiService.updateChannelViewers(
          this.chatApiService.getUser()?.id || 0,
          +this.serverID,
          +this.channelID
        ).subscribe((data: any) => {
          if (data.status === "OK") {
            this.viewers = data.viewers;
            this.chatApiService.announceChannelChange();
          }
        });

        this.chatApiService.getPeers(+this.serverID, +this.channelID).subscribe((data: any) => {
          if (data.status === "OK") {
            if (data.peers.length >= 1) {
              this.isCallRunning = true;
            }
          }
        });
        
        if (this.chatTitle === "") {
          this.router.navigateByUrl("/home");
        }
      }
    });

    this.chatApiService.onMessage().subscribe((data: Message) => {
      this.appendMessage(data);
    });

    this.chatApiService.onChannelChanged().pipe(takeUntil(this._destroy)).subscribe((data: any) => {
      this.chatApiService.updateChannelViewers(
        this.chatApiService.getUser()?.id || 0,
        +this.serverID,
        +this.channelID
      ).subscribe((data: any) => {
        if (data.status === "OK") {
          this.viewers = data.viewers;
        }
      });
    })

    this.chatApiService.onCallChanged().pipe(takeUntil(this._destroy)).subscribe((data: any) => {
      if (data.id === +this.channelID) {
        this.isCallRunning = data.state;
      }
    })
  }

  ngOnDestroy() {
    this._destroy.next(true);
    this._destroy.unsubscribe();
    return;
  }

  constructor(
    private router:Router,
    private route: ActivatedRoute,
    private chatApiService: ChatApiService,
    private modalService: NgbModal
  ) { }
}
